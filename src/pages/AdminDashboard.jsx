import { useEffect, useState } from 'react';
import SEO from '../components/SEO.jsx';

// Minimal, private admin view for the MealPrep+ waitlist.
// Security model: this page holds NO secrets. It asks for the admin token,
// keeps it in sessionStorage, and sends it to /api/admin-stats which validates
// it against ADMIN_DASHBOARD_TOKEN server-side. The registrations table is not
// publicly readable (RLS), so nothing is exposed without the token.
const TOKEN_KEY = 'mealprep_admin_token';

function StatCard({ label, value }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

function Breakdown({ title, data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="admin-breakdown">
      <h3>{title}</h3>
      {entries.length === 0 ? <p>No data yet.</p> : (
        <ul>
          {entries.map(([k, v]) => <li key={k}><span>{k}</span><strong>{v}</strong></li>)}
        </ul>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : '';
    if (saved) { setToken(saved); load(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(tk) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-stats', { headers: { 'x-admin-token': tk } });
      if (res.status === 401) throw new Error('Invalid token.');
      if (!res.ok) throw new Error('Could not load stats.');
      const data = await res.json();
      setStats(data);
      setAuthed(true);
      sessionStorage.setItem(TOKEN_KEY, tk);
    } catch (err) {
      setError(err.message || 'Could not load stats.');
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (token.trim()) load(token.trim());
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setStats(null);
    setToken('');
  }

  function downloadCsv() {
    // Token in query so the browser can follow it as a normal download.
    const url = `/api/admin-stats?format=csv&token=${encodeURIComponent(token.trim())}`;
    window.open(url, '_blank');
  }

  return (
    <>
      <SEO
        title="Waitlist Admin — MealPrep.org.uk"
        description="Private waitlist dashboard."
        canonical="https://www.mealprep.org.uk/admin"
        robots="noindex,nofollow"
      />
      <div className="page admin-page">
        <h1>MealPrep+ Waitlist Admin</h1>

        {!authed ? (
          <form className="admin-login" onSubmit={handleSubmit}>
            <label htmlFor="admin-token">Admin token</label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Enter admin token"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Checking…' : 'View dashboard'}
            </button>
            {error && <p className="waitlist-error" role="alert">{error}</p>}
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <button className="btn-secondary" onClick={() => load(token.trim())} disabled={loading}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <button className="btn-secondary" onClick={downloadCsv}>Export CSV</button>
              <button className="btn-secondary" onClick={logout}>Log out</button>
            </div>

            {stats && (
              <>
                <div className="admin-stats-grid">
                  <StatCard label="Total waitlist" value={stats.total} />
                  <StatCard label="Subscribed" value={stats.subscribed} />
                  <StatCard label="This week" value={stats.thisWeek} />
                  <StatCard label="This month" value={stats.thisMonth} />
                  <StatCard label="Welcome emails sent" value={stats.welcomeEmailsSent} />
                </div>

                <div className="admin-breakdowns">
                  <Breakdown title="By supermarket" data={stats.bySupermarket} />
                  <Breakdown title="By goal" data={stats.byGoal} />
                </div>

                <div className="admin-recent">
                  <h3>Most recent signups</h3>
                  <p className="admin-note">Email addresses are partially masked here. Use CSV export for the full list.</p>
                  <table className="content-table">
                    <thead>
                      <tr><th scope="col">Email</th><th scope="col">Name</th><th scope="col">Supermarket</th><th scope="col">Goal</th><th scope="col">Joined</th></tr>
                    </thead>
                    <tbody>
                      {stats.recent.map((r, i) => (
                        <tr key={i}>
                          <td>{r.email}</td>
                          <td>{r.first_name}</td>
                          <td>{r.supermarket}</td>
                          <td>{r.goal}</td>
                          <td>{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
