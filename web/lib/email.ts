import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Oakvale Jobs <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Sends an email via Resend. If no API key is configured (local dev), the email
 * is logged to the console instead so flows remain testable without credentials.
 */
export async function sendEmail({ to, subject, html }: SendArgs) {
  if (!resend) {
    console.info(`[email:dev] to=${Array.isArray(to) ? to.join(",") : to} subject="${subject}"`);
    return { skipped: true as const };
  }
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("resend error", error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error("email send failed", err);
    return { error: err };
  }
}

export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f9f6;font-family:Arial,Helvetica,sans-serif;color:#1a2419">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(135deg,#2E7D32,#1B5E20);color:#fff;padding:20px 24px;border-radius:16px 16px 0 0">
      <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em">Oakvale Jobs</div>
    </div>
    <div style="background:#fff;border:1px solid #e2ebe1;border-top:none;padding:24px;border-radius:0 0 16px 16px">
      <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#3a463a">${body}</div>
    </div>
    <p style="color:#8a948a;font-size:12px;text-align:center;margin-top:16px">
      Oakvale Learning Ltd · jobs.oakvaleltd.com
    </p>
  </div></body></html>`;
}
