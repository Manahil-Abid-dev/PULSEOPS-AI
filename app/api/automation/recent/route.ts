import { NextRequest, NextResponse } from "next/server";
import { requireAutomationKey } from "@/lib/automation-auth";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";

const DEFAULT_WINDOW_MS = 4 * 60 * 60 * 1000; // matches the 4-hourly cron in vercel.json

export async function GET(req: NextRequest) {
  const unauthorized = requireAutomationKey(req);
  if (unauthorized) return unauthorized;

  try {
    const sinceParam = req.nextUrl.searchParams.get("since");
    const sinceMs = sinceParam ? Date.parse(sinceParam) : NaN;
    const since = Number.isNaN(sinceMs) ? Date.now() - DEFAULT_WINDOW_MS : sinceMs;

    const snapshot = await getBusinessSnapshot();

    const newOrders = snapshot.orders
      .filter((o) => new Date(o.createdAt).getTime() > since)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      }));

    const newCustomers = snapshot.customers
      .filter((c) => new Date(c.createdAt).getTime() > since)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => ({ id: c.id, name: c.name, company: c.company, email: c.email, createdAt: c.createdAt }));

    if ((newOrders.length > 0 || newCustomers.length > 0) && process.env.SLACK_WEBHOOK_URL) {
      const lines: string[] = [];
      for (const o of newOrders) lines.push(`• *[New Order]* ${o.orderNumber}: $${o.total.toFixed(2)} by ${o.customerName}`);
      for (const c of newCustomers) lines.push(`• *[New Customer]* ${c.name} (${c.company})`);

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "⚡ Recent Activity Digest",
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: `⚡ *Recent System Activity*\n${lines.join("\n")}` },
            },
          ],
        }),
      });
    }
// 2. Email Automation Chunk
    const ownerEmail = process.env.OWNER_EMAIL || "OWNER_EMAIL";

    if (process.env.RESEND_API_KEY) {
      const { sendAutomationEmail } = await import('@/lib/email');
      await sendAutomationEmail({
        toEmail: ownerEmail,
        subject: "⚡ Recent Activity Digest",
        title: "Recent System Activity",
        htmlContent: `
          <p>Here is your recent activity snapshot:</p>
          <ul>
            <li><strong>Status:</strong> Active</li>
            <li><strong>Executed At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Log in to your dashboard to review live activity details.</p>
        `
      });
    }
    return NextResponse.json({
      success: true,
      since: new Date(since).toISOString(),
      newOrdersCount: newOrders.length,
      newCustomersCount: newCustomers.length,
      newOrders,
      newCustomers,
    });
  } catch (error: any) {
    console.error("[automation/recent] failed:", error);
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 });
  }
}