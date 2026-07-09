// Vercel serverless function: POST /api/feedback
// Sends site feedback through a private webhook or Resend.

const DEFAULT_FEEDBACK_TO = 'mealprep.org.uk@proton.me';
const DEFAULT_FEEDBACK_FROM = 'MealPrep Feedback <onboarding@resend.dev>';
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

  const subject = 'MealPrep.org.uk feedback';
  const payload = {
    site: 'MealPrep.org.uk',
    type: 'feedback',
    submittedAt: new Date().toISOString(),
    feedback,
    source: source || 'Unknown',
    userAgent: userAgent || 'Unknown',
  };

  const webhookUrl = cleanUrl(process.env.FEEDBACK_WEBHOOK_URL);
  if (webhookUrl) {
    try {
      await sendFeedbackWebhook(webhookUrl, payload);
      return res.status(200).json({ ok: true, provider: 'webhook' });
    } catch (err) {
      console.error('Feedback webhook error:', err);
      return acceptFeedbackFallback(res, payload, 'webhook_error', err);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Feedback provider missing: set FEEDBACK_WEBHOOK_URL or RESEND_API_KEY.');
    return acceptFeedbackFallback(res, payload, 'provider_missing');
  }

  const from = resolveFeedbackFrom(process.env.MEALPREP_FROM_EMAIL || process.env.FEEDBACK_FROM_EMAIL);
  const to = cleanEmailHeader(
    process.env.MEALPREP_FEEDBACK_TO_EMAIL || process.env.FEEDBACK_TO_EMAIL,
    DEFAULT_FEEDBACK_TO,
  );
  const replyTo = cleanEmailHeader(process.env.MEALPREP_REPLY_TO_EMAIL, DEFAULT_FEEDBACK_TO);
  const recipients = parseEmailRecipients(to);
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
        to: recipients,
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', emailRes.status, errText);
      return acceptFeedbackFallback(
        res,
        payload,
        `resend_${emailRes.status}`,
        new Error(errText.slice(0, 500)),
      );
    }

    const data = await emailRes.json();
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error(err);
    return acceptFeedbackFallback(res, payload, 'send_exception', err);
  }
}

function acceptFeedbackFallback(res, payload, reason, err) {
  const fallbackPayload = {
    ...payload,
    deliveryFallback: true,
    deliveryReason: reason,
  };

  console.warn('Feedback accepted without email delivery:', JSON.stringify(fallbackPayload));
  if (err) {
    console.error('Feedback fallback reason:', err);
  }

  return res.status(202).json({
    ok: true,
    provider: 'server-log',
    warning: 'Feedback was received, but email delivery is temporarily unavailable.',
  });
}

async function sendFeedbackWebhook(webhookUrl, payload) {
  const webhookRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MealPrep.org.uk feedback bot',
    },
    body: JSON.stringify(payload),
  });

  if (!webhookRes.ok) {
    const errText = await webhookRes.text();
    throw new Error(`Webhook returned ${webhookRes.status}: ${errText.slice(0, 500)}`);
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

function cleanEmailHeader(value, fallback) {
  const cleaned = String(value || fallback || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[\r\n]+/g, ' ');

  return cleaned || fallback;
}

function cleanUrl(value) {
  const cleaned = String(value || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return '';

  try {
    const url = new URL(cleaned);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function resolveFeedbackFrom(value) {
  const cleaned = cleanEmailHeader(value, '');
  if (!cleaned || /yourdomain\.com|example\.com/i.test(cleaned)) {
    return DEFAULT_FEEDBACK_FROM;
  }

  return cleaned;
}

function parseEmailRecipients(value) {
  const recipients = String(value || '')
    .split(',')
    .map(item => cleanEmailHeader(item, ''))
    .filter(Boolean);

  return recipients.length ? recipients : [DEFAULT_FEEDBACK_TO];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
