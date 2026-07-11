import {
  cleanEmail,
  cleanHeader,
  escapeHtml,
} from './http.js';

const DEFAULT_FROM = 'MealPrep.org.uk <onboarding@resend.dev>';
const DEFAULT_REPLY_TO = 'mealprep.org.uk@proton.me';

export function resolveEmailFrom(primary, fallback = DEFAULT_FROM) {
  const cleaned = cleanHeader(primary);
  if (!cleaned || /yourdomain\.com|example\.com/i.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

export function resolveReplyTo(value) {
  return cleanHeader(value) || DEFAULT_REPLY_TO;
}

export async function sendResendEmail({
  from,
  to,
  replyTo,
  subject,
  text,
  html,
  idempotencyKey,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const recipients = normaliseRecipients(to);
  if (!recipients.length) {
    throw new Error('A valid recipient email is required.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (idempotencyKey) {
    headers['Idempotency-Key'] = cleanHeader(idempotencyKey).slice(0, 200);
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: resolveEmailFrom(from),
      to: recipients,
      reply_to: resolveReplyTo(replyTo),
      subject: cleanHeader(subject).slice(0, 140),
      text,
      html,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    throw new Error(`Resend ${emailRes.status}: ${errText.slice(0, 500)}`);
  }

  return emailRes.json();
}

export function buildHtmlEmail({ title, preview, bodyHtml }) {
  return `
    <div style="margin:0;padding:0;background:#f6f7f5;color:#17130d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview || title || '')}</div>
      <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
        <div style="background:#ffffff;border:1px solid #e6e1d7;border-radius:14px;padding:28px;">
          <p style="margin:0 0 8px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">MealPrep.org.uk</p>
          <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#17130d;">${escapeHtml(title)}</h1>
          ${bodyHtml}
        </div>
        <p style="margin:16px 4px 0;color:#777064;font-size:12px;line-height:1.5;">
          You received this because you asked MealPrep.org.uk to email you a meal plan.
        </p>
      </div>
    </div>
  `;
}

function normaliseRecipients(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(',');
  return source.map(cleanEmail).filter(Boolean);
}
