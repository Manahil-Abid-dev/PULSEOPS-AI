import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendReportOptions {
  toEmail: string;
  subject: string;
  title: string;
  htmlContent: string;
}

export async function sendAutomationEmail({ toEmail, subject, title, htmlContent }: SendReportOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping email send.");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: 'PulseOps Automation <onboarding@resend.dev>', // Change to your custom domain once verified
      to: [toEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0070f3; margin-top: 0;">${title}</h2>
          <div style="font-size: 15px; line-height: 1.6;">
            ${htmlContent}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">This is an automated report from your PulseOps AI System.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error: error.message };
  }
}