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

    // Send summary directly to Slack if Webhook is set
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "📸 Business Snapshot Update",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `📸 *Latest Business Snapshot*\n${summary.headline}`
              }
            }
          ]
        })
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
    return NextResponse.json({ metrics: snapshot.metrics, summary });
  } catch (error: any) {
    console.error("[automation/snapshot] failed:", error);
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 });
  }
}