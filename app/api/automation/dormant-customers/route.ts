import { NextRequest, NextResponse } from "next/server";
import { requireAutomationKey } from "@/lib/automation-auth";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";

const DORMANT_THRESHOLD_DAYS = 40;

export async function GET(req: NextRequest) {
  const unauthorized = requireAutomationKey(req);
  if (unauthorized) return unauthorized;

  try {
    const snapshot = await getBusinessSnapshot();
    const now = Date.now();

    // Last order date per customer, derived straight from orders (kept local
    // to this route, rather than businessMetrics.ts, so it can include email
    // for outreach and isn't capped to the top 5 used on the dashboard).
    const lastOrderByCustomer = new Map<string, string>();
    for (const order of snapshot.orders) {
      const existing = lastOrderByCustomer.get(order.customerId);
      if (!existing || new Date(order.createdAt) > new Date(existing)) {
        lastOrderByCustomer.set(order.customerId, order.createdAt);
      }
    }

    const dormantCustomers = snapshot.customers
      .filter((c) => c.status === "active")
      .map((c) => {
        const lastOrderAt = lastOrderByCustomer.get(c.id) ?? null;
        const daysInactive = lastOrderAt
          ? Math.floor((now - new Date(lastOrderAt).getTime()) / 86_400_000)
          : null;
        return { id: c.id, name: c.name, company: c.company, email: c.email, lastOrderAt, daysInactive };
      })
      // Only flag customers with at least one past order that's gone quiet;
      // customers who never ordered belong in a separate "never converted" list.
      .filter((c) => c.daysInactive !== null && c.daysInactive >= DORMANT_THRESHOLD_DAYS)
      .sort((a, b) => (b.daysInactive ?? 0) - (a.daysInactive ?? 0));

    if (dormantCustomers.length > 0 && process.env.SLACK_WEBHOOK_URL) {
      const customerList = dormantCustomers
        .slice(0, 10)
        .map((c) => `• *${c.name}* (${c.company}) — ${c.daysInactive}d inactive`)
        .join("\n");

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "💤 Dormant Customers Report",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `💤 *Dormant Wholesale Buyers (${DORMANT_THRESHOLD_DAYS}+ days inactive)*\nFound ${dormantCustomers.length}:\n${customerList}`,
              },
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
        subject: "💤 Dormant Customers Report",
        title: "Dormant Customers Scan",
        htmlContent: `
          <p>Here is your automated customer inactivity summary:</p>
          <ul>
            <li><strong>Scan Status:</strong> Completed</li>
            <li><strong>Executed At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Log in to your dashboard to launch re-engagement campaigns.</p>
        `
      });
    }
    return NextResponse.json({ success: true, count: dormantCustomers.length, dormantCustomers });
  } catch (error: any) {
    console.error("[automation/dormant-customers] failed:", error);
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 });
  }
}