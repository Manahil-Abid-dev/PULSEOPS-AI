import { NextRequest, NextResponse } from "next/server";
import { requireAutomationKey } from "@/lib/automation-auth";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";
import { getExecutiveSummary } from "@/lib/executiveSummary";

export async function GET(req: NextRequest) {
  const unauthorized = requireAutomationKey(req);
  if (unauthorized) return unauthorized;

  try {
    const snapshot = await getBusinessSnapshot();
    const summary = await getExecutiveSummary(snapshot.metrics);

    // 1. Send Slack Webhook Notification
    if (process.env.SLACK_WEBHOOK_URL) {
      const actionItems = summary.actionItems.slice(0, 3).map((a) => `• ${a}`).join("\n");
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "📊 Daily Executive Briefing",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  `📊 *Daily Executive Briefing*\n` +
                  `*Health:* ${summary.healthLabel} (${summary.healthScore}/100)\n` +
                  `*${summary.headline}*\n` +
                  (actionItems ? `\n*Top action items:*\n${actionItems}` : ""),
              },
            },
          ],
        }),
      });
    }

    // 2. Send Email Automation Notification
    const ownerEmail = process.env.OWNER_EMAIL || "OWNER_EMAIL";

    if (process.env.RESEND_API_KEY) {
      const { sendAutomationEmail } = await import('@/lib/email');
      await sendAutomationEmail({
        toEmail: ownerEmail,
        subject: "📊 PulseOps Executive Briefing",
        title: "Daily Executive Briefing Report",
        htmlContent: `
          <p>Here is your automated business summary snapshot:</p>
          <ul>
            <li><strong>Health Score:</strong> ${summary.healthLabel} (${summary.healthScore}/100)</li>
            <li><strong>Headline:</strong> ${summary.headline}</li>
            <li><strong>Executed At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Log in to your dashboard to view complete details.</p>
        `
      });
    }

    return NextResponse.json({ success: true, metrics: snapshot.metrics, summary });
  } catch (error: any) {
    console.error("[automation/briefing] failed:", error);
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 });
  }
}