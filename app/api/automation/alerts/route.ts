import { NextRequest, NextResponse } from "next/server";
import { requireAutomationKey } from "@/lib/automation-auth";
import { getProducts } from "@/lib/product";
import { getInvoices } from "@/lib/invoice";
import { getCustomers } from "@/lib/customer";

export async function GET(req: NextRequest) {
  const unauthorized = requireAutomationKey(req);
  if (unauthorized) return unauthorized;

  const [products, invoices, customers] = await Promise.all([getProducts(), getInvoices(), getCustomers()]);
  const customerById = new Map((customers as any[]).map((c) => [c.id, c]));

  const lowStock = (products as any[])
    .filter((p) => p.status !== "in-stock")
    .map((p) => ({ id: p.id, name: p.name, quantity: p.quantity, status: p.status }));

  const overdueInvoices = (invoices as any[])
    .filter((inv) => inv.status === "Overdue")
    .map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      customerEmail: customerById.get(inv.customerId)?.email ?? null,
      grandTotal: inv.grandTotal,
      dueDate: inv.dueDate,
    }));

  // Send straight to Slack if there's anything worth flagging — no n8n needed.
  if ((lowStock.length > 0 || overdueInvoices.length > 0) && process.env.SLACK_WEBHOOK_URL) {
    const overdueTotal = overdueInvoices.reduce((s, i) => s + i.grandTotal, 0);
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `:warning: *Business Alert*\nLow stock items: ${lowStock.length}\nOverdue invoices: ${overdueInvoices.length} totaling $${overdueTotal.toFixed(2)}`,
      }),
    });
  }
// 2. Email Automation Chunk
    const ownerEmail = process.env.OWNER_EMAIL || "OWNER_EMAIL";

    if (process.env.RESEND_API_KEY) {
      const { sendAutomationEmail } = await import('@/lib/email');
      await sendAutomationEmail({
        toEmail: ownerEmail,
        subject: "🚨 PulseOps System Alerts",
        title: "System Alerts Notification",
        htmlContent: `
          <p>System alerts were checked and dispatched:</p>
          <ul>
            <li><strong>Status:</strong> Scanned</li>
            <li><strong>Executed At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Log in to your dashboard to resolve open alerts.</p>
        `
      });
    }
  return NextResponse.json({ lowStock, overdueInvoices, notified: true });
}