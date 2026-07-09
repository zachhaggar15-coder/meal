// Vercel serverless function: POST /api/waitlist
// Saves a MealPrep+ waitlist registration to Supabase, then sends a welcome
// email via Resend. Registrations are never lost if the email step fails.
//
// Required env vars (server-side only — never exposed to the browser):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// Optional:
//   RESEND_API_KEY                 (welcome email; skipped if absent)
//   MEALPREP_WAITLIST_FROM_EMAIL   (from header; default onboarding sender)
//   MEALPREP_REPLY_TO_EMAIL        (default mealprep.org.uk@proton.me)

const WELCOME_REPLY_TO = 'mealprep.org.uk@proton.me';
const DEFAULT_FROM = 'MealPrep.org.uk <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allow-lists mirror src/data/waitlistOptions.js. Unknown values are dropped
// rather than stored, so the column stays clean for later segmentation.
const SUPERMARKETS = new Set([
  'Tesco', 'Aldi', 'Lidl', 'Asda', 'Morrisons', "Sainsbury's", 'Iceland', 'No preference',
]);
const GOALS = new Set([
  'Lose weight', 'High protein', 'Build muscle', 'Budget meals',
  'Family meals', 'Student meals', 'Vegetarian', 'Healthy eating',
]);

// Best-effort in-memory rate limit. Survives only within a warm instance, so it
// is a courtesy speed-bump, not a hard guarantee — the honeypot, email
// validation and the unique-email constraint are the real protections. For
// strict limits across instances use Upstash/Redis (see docs/waitlist-setup.md).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const hits = new Map();

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const bucket = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  bucket.push(now);
  hits.set(ip, bucket);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return bucket.length > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const body = parseBody(req.body);

  // Honeypot: real users never fill the hidden "website" field.
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const ip = cleanMeta(
    (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || '',
  );
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
  }

  const firstName = cleanMeta(body.firstName || body.first_name || '').slice(0, 80) || null;
  const supermarket = SUPERMARKETS.has(body.supermarket) ? body.supermarket : null;
  const goal = GOALS.has(body.goal) ? body.goal : null;
  const sourcePage = cleanMeta(body.source || req.headers.referer || '').slice(0, 500) || null;

  const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('Waitlist misconfigured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return res.status(500).json({ error: 'The waitlist is temporarily unavailable. Please try again later.' });
  }

  const restUrl = `${supabaseUrl}/rest/v1/interest_registrations`;
  const authHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  // ── Insert ──────────────────────────────────────────────────────────────────
  let row;
  try {
    const insertRes = await fetch(restUrl, {
      method: 'POST',
      headers: { ...authHeaders, Prefer: 'return=representation' },
      body: JSON.stringify({
        email,
        first_name: firstName,
        supermarket,
        goal,
        source_page: sourcePage,
      }),
    });

    if (insertRes.status === 409) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      // 23505 = unique_violation, in case the status is surfaced differently.
      if (insertRes.status === 422 && errText.includes('23505')) {
        return res.status(200).json({ ok: true, duplicate: true });
      }
      console.error('Supabase insert error:', insertRes.status, errText.slice(0, 500));
      return res.status(500).json({ error: 'We could not save your details. Please try again.' });
    }

    const data = await insertRes.json();
    row = Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error('Supabase insert exception:', err);
    return res.status(500).json({ error: 'We could not save your details. Please try again.' });
  }

  // Registration is now safely stored. From here, any email failure must NOT
  // fail the request.
  await sendWelcomeEmail({ email, firstName, row, restUrl, authHeaders }).catch(err => {
    console.error('Waitlist welcome email failed (registration kept):', err);
  });

  return res.status(200).json({ ok: true, duplicate: false });
}

async function sendWelcomeEmail({ email, firstName, row, restUrl, authHeaders }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping waitlist welcome email.');
    return;
  }

  const from = cleanHeader(process.env.MEALPREP_WAITLIST_FROM_EMAIL) || DEFAULT_FROM;
  const replyTo = cleanHeader(process.env.MEALPREP_REPLY_TO_EMAIL) || WELCOME_REPLY_TO;
  const name = firstName || 'there';

  const text = [
    `Hi ${name},`,
    '',
    'Thanks for joining the MealPrep+ waitlist.',
    '',
    "MealPrep+ is something we're considering building to remove the weekly hassle of meal planning.",
    '',
    'The idea is simple:',
    '',
    'Every week, you\'d receive a personalised meal plan built around your calorie target, protein goal, budget and favourite UK supermarket.',
    '',
    'That would include:',
    '',
    '- A complete weekly meal plan',
    '- Shopping list',
    '- Estimated cost',
    '- Recipes',
    '- Calories and protein',
    '- Simple meal prep instructions',
    '',
    "At the moment, we're simply measuring demand.",
    '',
    'Nothing is being sold today and you won\'t be charged.',
    '',
    "If enough people join the waitlist, we'll start building MealPrep+ and you'll be among the first to know.",
    '',
    'Thanks again,',
    '',
    'MealPrep.org.uk',
  ].join('\n');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for joining the <strong>MealPrep+</strong> waitlist.</p>
      <p>MealPrep+ is something we're considering building to remove the weekly hassle of meal planning.</p>
      <p>The idea is simple: every week, you'd receive a personalised meal plan built around your calorie target, protein goal, budget and favourite UK supermarket.</p>
      <p>That would include:</p>
      <ul>
        <li>A complete weekly meal plan</li>
        <li>Shopping list</li>
        <li>Estimated cost</li>
        <li>Recipes</li>
        <li>Calories and protein</li>
        <li>Simple meal prep instructions</li>
      </ul>
      <p>At the moment, we're simply measuring demand. Nothing is being sold today and you won't be charged.</p>
      <p>If enough people join the waitlist, we'll start building MealPrep+ and you'll be among the first to know.</p>
      <p>Thanks again,<br>MealPrep.org.uk</p>
    </div>
  `;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: replyTo,
      subject: "You're on the MealPrep+ waitlist",
      text,
      html,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    throw new Error(`Resend ${emailRes.status}: ${errText.slice(0, 300)}`);
  }

  // Mark the welcome email as sent. Non-fatal if it fails.
  if (row?.id) {
    try {
      await fetch(`${restUrl}?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({ welcome_email_sent: true }),
      });
    } catch (err) {
      console.error('Failed to flag welcome_email_sent (email was sent):', err);
    }
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try { return JSON.parse(body); } catch { return {}; }
}

function cleanMeta(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function cleanHeader(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/[\r\n]+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
