// Vercel serverless function: POST /api/feedback
// Sends site feedback to the configured inbox via Resend.

const FEEDBACK_TO = 'dojostack@protonmail.com';
const MAX_FEEDBACK_LENGTH = 4000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = parseBody(req.body);
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
  const source = cleanMeta(body.source || req.headers.referer || '');
  const userAgent = cleanMeta(req.headers['user-agent'] || '');

  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  if (!feedback) {
    return res.status(400).json({ error: 'Please enter feedback before submitting.' });
  }

  if (feedback.length > MAX_FEEDBACK_LENGTH) {
    return res.status(400).json({ error: `Feedback must be ${MAX_FEEDBACK_LENGTH} characters or fewer.` });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Feedback email is not configured yet.' });
  }

  const from = process.env.FEEDBACK_FROM_EMAIL || 'MealPrep Feedback <onboarding@resend.dev>';
  const subject = 'MealPrep.org.uk feedback';
  const text = [
    'New MealPrep.org.uk feedback',
    '',
    feedback,
    '',
    `Source: ${source || 'Unknown'}`,
    `User agent: ${userAgent || 'Unknown'}`,
  ].join('\n');
  const html = `
    <h2>New MealPrep.org.uk feedback</h2>
    <p>${escapeHtml(feedback).replace(/\n/g, '<br>')}</p>
    <hr>
    <p><strong>Source:</strong> ${escapeHtml(source || 'Unknown')}</p>
    <p><strong>User agent:</strong> ${escapeHtml(userAgent || 'Unknown')}</p>
  `;

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: FEEDBACK_TO,
        subject,
        text,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', emailRes.status, errText);
      return res.status(502).json({ error: 'Could not send feedback right now. Please try again later.' });
    }

    const data = await emailRes.json();
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong sending feedback. Please try again.' });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try { return JSON.parse(body); } catch { return {}; }
}

function cleanMeta(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 500);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
