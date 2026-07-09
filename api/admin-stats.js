// Vercel serverless function: GET /api/admin-stats
// Returns aggregate MealPrep+ waitlist stats, or a CSV export.
// Access is gated by a shared secret sent in the `x-admin-token` header
// (or ?token= for the CSV download link). Emails are only ever returned to a
// caller holding the token — never to the public.
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   ADMIN_DASHBOARD_TOKEN   (a long random string you choose)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  const provided = req.headers['x-admin-token'] || req.query?.token || '';
  if (!expected || !safeEqual(String(provided), String(expected))) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server not configured for Supabase.' });
  }

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const restUrl = `${supabaseUrl}/rest/v1/interest_registrations`;

  let rows;
  try {
    const r = await fetch(
      `${restUrl}?select=email,first_name,supermarket,goal,source_page,subscribed,welcome_email_sent,created_at&order=created_at.desc`,
      { headers },
    );
    if (!r.ok) {
      const t = await r.text();
      console.error('Supabase read error:', r.status, t.slice(0, 300));
      return res.status(500).json({ error: 'Could not read registrations.' });
    }
    rows = await r.json();
  } catch (err) {
    console.error('Supabase read exception:', err);
    return res.status(500).json({ error: 'Could not read registrations.' });
  }

  // CSV export
  if (String(req.query?.format || '').toLowerCase() === 'csv') {
    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mealprep-waitlist.csv"');
    return res.status(200).send(csv);
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: rows.length,
    subscribed: rows.filter(r => r.subscribed).length,
    welcomeEmailsSent: rows.filter(r => r.welcome_email_sent).length,
    thisWeek: rows.filter(r => new Date(r.created_at) >= weekAgo).length,
    thisMonth: rows.filter(r => new Date(r.created_at) >= monthAgo).length,
    bySupermarket: countBy(rows, 'supermarket'),
    byGoal: countBy(rows, 'goal'),
    recent: rows.slice(0, 15).map(r => ({
      email: maskEmail(r.email),
      first_name: r.first_name || '',
      supermarket: r.supermarket || '',
      goal: r.goal || '',
      created_at: r.created_at,
    })),
  };

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(stats);
}

function countBy(rows, key) {
  const out = {};
  for (const r of rows) {
    const v = r[key] || 'Not specified';
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

function maskEmail(email) {
  const [user, domain] = String(email || '').split('@');
  if (!domain) return '***';
  const head = user.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

function toCsv(rows) {
  const cols = ['email', 'first_name', 'supermarket', 'goal', 'source_page', 'subscribed', 'welcome_email_sent', 'created_at'];
  const esc = v => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map(c => esc(r[c])).join(','));
  return lines.join('\r\n');
}

// Length-safe, timing-safe-ish string compare.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
