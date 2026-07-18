import { useEffect, useState } from 'react';
import SEO from '../components/SEO.jsx';

// Private admin view for waitlist and first-party analytics.
// Security model: this page holds NO secrets. It asks for the admin token,
// keeps it in sessionStorage, and sends it to /api/admin-stats, which validates
// it against ADMIN_DASHBOARD_TOKEN server-side.
const TOKEN_KEY = 'mealprep_admin_token';

function StatCard({ label, value, detail }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
      {detail && <span className="admin-stat-detail">{detail}</span>}
    </div>
  );
}

function Breakdown({ title, data }) {
  const entries = Array.isArray(data)
    ? data.map(item => [item.name, item.value])
    : Object.entries(data || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="admin-breakdown">
      <h3>{title}</h3>
      {entries.length === 0 ? <p>No data yet.</p> : (
        <ul>
          {entries.map(([key, value]) => <li key={key}><span>{key}</span><strong>{value}</strong></li>)}
        </ul>
      )}
    </div>
  );
}

function DataTable({ title, note, rows, columns, empty = 'No data yet.' }) {
  return (
    <section className="admin-table-section">
      <div className="admin-section-head">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </div>
      {rows.length === 0 ? <p className="admin-note">{empty}</p> : (
        <div className="content-table-wrap">
          <table className="content-table admin-data-table">
            <thead>
              <tr>
                {columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || `${title}-${index}`}>
                  {columns.map(column => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : '';
    if (saved) {
      setToken(saved);
      load(saved);
    }
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

  function handleSubmit(event) {
    event.preventDefault();
    if (token.trim()) load(token.trim());
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setStats(null);
    setToken('');
  }

  async function downloadCsv(format) {
    setExporting(format);
    setError('');
    try {
      const res = await fetch(`/api/admin-stats?format=${encodeURIComponent(format)}`, {
        headers: { 'x-admin-token': token.trim() },
      });
      if (res.status === 401) throw new Error('Invalid token.');
      if (!res.ok) throw new Error('Could not export CSV.');

      const blob = await res.blob();
      const filename = filenameFromContentDisposition(
        res.headers.get('Content-Disposition'),
        `${format}.csv`,
      );
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || 'Could not export CSV.');
    } finally {
      setExporting('');
    }
  }

  return (
    <>
      <SEO
        title="Admin Dashboard | MealPrep.org.uk"
        description="Private MealPrep.org.uk dashboard."
        canonical="https://www.mealprep.org.uk/admin"
        robots="noindex,nofollow"
      />
      <div className="page admin-page">
        <h1>MealPrep Admin</h1>

        {!authed ? (
          <form className="admin-login" onSubmit={handleSubmit}>
            <label htmlFor="admin-token">Admin token</label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={event => setToken(event.target.value)}
              placeholder="Enter admin token"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Checking...' : 'View dashboard'}
            </button>
            {error && <p className="waitlist-error" role="alert">{error}</p>}
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <button className="btn-secondary" onClick={() => load(token.trim())} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="btn-secondary" onClick={() => downloadCsv('analytics-events-csv')} disabled={Boolean(exporting)}>
                {exporting === 'analytics-events-csv' ? 'Exporting...' : 'Export event log'}
              </button>
              <button className="btn-secondary" onClick={() => downloadCsv('analytics-sessions-csv')} disabled={Boolean(exporting)}>
                {exporting === 'analytics-sessions-csv' ? 'Exporting...' : 'Export sessions'}
              </button>
              <button className="btn-secondary" onClick={() => downloadCsv('csv')} disabled={Boolean(exporting)}>
                {exporting === 'csv' ? 'Exporting...' : 'Export waitlist'}
              </button>
              <button className="btn-secondary" onClick={logout}>Log out</button>
            </div>
            {error && <p className="waitlist-error" role="alert">{error}</p>}

            {stats?.analytics && <AnalyticsSection analytics={stats.analytics} />}
            {stats && <WaitlistSection stats={stats} />}
          </>
        )}
      </div>
    </>
  );
}

function AnalyticsSection({ analytics }) {
  if (!analytics.configured) {
    return (
      <section className="admin-panel">
        <div className="admin-section-head">
          <h2>Behaviour Analytics</h2>
          <p>{analytics.error}</p>
        </div>
      </section>
    );
  }

  const overview = analytics.overview || {};

  return (
    <section className="admin-panel admin-analytics">
      <div className="admin-section-head">
        <h2>Behaviour Analytics</h2>
        <p>
          First-party session analytics from visitors who accepted optional analytics.
          Raw exports include the full click and event trail.
        </p>
      </div>

      <div className="admin-stats-grid admin-stats-grid--wide">
        <StatCard label="Sessions" value={number(overview.sessions)} />
        <StatCard label="Page views" value={number(overview.pageViews)} />
        <StatCard label="Clicks logged" value={number(overview.clicks)} />
        <StatCard label="Internal searches" value={number(overview.internalSearches)} />
        <StatCard label="Outbound clicks" value={number(overview.outboundClicks)} />
        <StatCard label="Avg engaged time" value={`${number(overview.avgEngagedSeconds)}s`} />
        <StatCard label="Avg max scroll" value={`${number(overview.avgMaxScrollDepth)}%`} />
        <StatCard label="Avg exploration" value={`${number(overview.avgExplorationScore)}/100`} />
      </div>

      <div className="admin-breakdowns admin-breakdowns--three">
        <Breakdown title="Entry source" data={analytics.entrySources || []} />
        <Breakdown title="Original intent" data={analytics.topEntryIntents || []} />
        <Breakdown title="Top pages" data={analytics.topPages || []} />
      </div>

      <DataTable
        title="Recent Click Log"
        note="Every row is a click-like event: buttons, links, affiliate exits, CTAs and named product clicks."
        rows={analytics.recentClicks || []}
        columns={[
          { key: 'at', label: 'Time', render: row => shortDate(row.at) },
          { key: 'session', label: 'Session' },
          { key: 'event', label: 'Event' },
          { key: 'path', label: 'Page', render: row => truncate(row.path, 42) },
          { key: 'label', label: 'Clicked', render: row => truncate(row.label, 52) },
          { key: 'href', label: 'Destination', render: row => truncate(row.href || row.host, 46) },
        ]}
      />

      <DataTable
        title="Top Click Targets"
        rows={analytics.topClicks || []}
        columns={[
          { key: 'label', label: 'Clicked', render: row => truncate(row.label, 54) },
          { key: 'event', label: 'Event' },
          { key: 'path', label: 'Page', render: row => truncate(row.path, 44) },
          { key: 'count', label: 'Clicks' },
          { key: 'sessions', label: 'Sessions' },
        ]}
      />

      <div className="admin-grid-two">
        <DataTable
          title="Content Actually Seen"
          note="Based on headings/sections entering the viewport, not just page loads."
          rows={analytics.contentSeen || []}
          columns={[
            { key: 'section', label: 'Section', render: row => truncate(row.section, 42) },
            { key: 'path', label: 'Page', render: row => truncate(row.path, 34) },
            { key: 'sessions', label: 'Sessions' },
            { key: 'views', label: 'Views' },
          ]}
        />

        <DataTable
          title="Scroll Depth By Page"
          rows={analytics.scrollDepthByPage || []}
          columns={[
            { key: 'path', label: 'Page', render: row => truncate(row.path, 44) },
            { key: 'sessions', label: 'Sessions' },
            { key: 'avgDepth', label: 'Avg depth', render: row => `${number(row.avgDepth)}%` },
            { key: 'deepest', label: 'Deepest', render: row => `${number(row.deepest)}%` },
          ]}
        />
      </div>

      <JourneyList title="Session Journeys" journeys={analytics.sessionJourneys || []} />
      <JourneyList title="Exploration Beyond Entry Intent" journeys={analytics.explorationLeaders || []} compact />

      <p className="admin-note">
        Sample window: latest {number(analytics.sample?.events)} events and {number(analytics.sample?.sessions)} sessions.
      </p>
    </section>
  );
}

function JourneyList({ title, journeys, compact = false }) {
  return (
    <section className="admin-table-section">
      <div className="admin-section-head">
        <h3>{title}</h3>
        <p>
          Exploration score increases when a session moves into new content categories,
          searches internally, clicks deeper, scrolls far, and views multiple sections.
        </p>
      </div>
      {journeys.length === 0 ? <p className="admin-note">No journeys yet.</p> : (
        <div className="admin-journey-list">
          {journeys.slice(0, compact ? 10 : 18).map(journey => (
            <details className="admin-journey" key={`${title}-${journey.session}-${journey.startedAt}`}>
              <summary>
                <span className="admin-journey-score">{journey.explorationScore}/100</span>
                <span>{journey.entryIntent}</span>
                <span>{journey.pageCount} page{journey.pageCount === 1 ? '' : 's'}</span>
                <span>{journey.maxScrollDepth}% max scroll</span>
              </summary>
              <div className="admin-journey-body">
                <dl>
                  <div><dt>Session</dt><dd>{journey.session}</dd></div>
                  <div><dt>Started</dt><dd>{shortDate(journey.startedAt)}</dd></div>
                  <div><dt>Source</dt><dd>{journey.entrySource}</dd></div>
                  <div><dt>Device</dt><dd>{journey.device || 'unknown'}</dd></div>
                  <div><dt>Engaged</dt><dd>{number(journey.engagedSeconds)}s</dd></div>
                  <div><dt>Clicks</dt><dd>{journey.clickCount}</dd></div>
                  <div><dt>Searches</dt><dd>{journey.searchCount}</dd></div>
                  <div><dt>Sections</dt><dd>{journey.sectionCount}</dd></div>
                </dl>
                <div className="admin-pill-row">
                  {journey.pages.map(page => <span key={page}>{truncate(page, 52)}</span>)}
                </div>
                {journey.beyondEntryCategories.length > 0 && (
                  <p className="admin-note">
                    Beyond entry: {journey.beyondEntryCategories.join(', ')}
                  </p>
                )}
                <ol className="admin-timeline">
                  {journey.timeline.map((item, index) => (
                    <li key={`${item.at}-${index}`}>
                      <strong>{item.event}</strong>
                      <span>{truncate(item.label || item.path, 74)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function WaitlistSection({ stats }) {
  return (
    <section className="admin-panel">
      <div className="admin-section-head">
        <h2>MealPrep+ Waitlist</h2>
      </div>

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

      <DataTable
        title="Most Recent Signups"
        note="Email addresses are partially masked here. Use CSV export for the full list."
        rows={stats.recent || []}
        columns={[
          { key: 'email', label: 'Email' },
          { key: 'first_name', label: 'Name' },
          { key: 'supermarket', label: 'Supermarket' },
          { key: 'goal', label: 'Goal' },
          { key: 'created_at', label: 'Joined', render: row => dateOnly(row.created_at) },
        ]}
      />
    </section>
  );
}

function number(value) {
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function shortDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateOnly(value) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '';
}

function truncate(value, maxLength) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 1))}...` : text;
}

function filenameFromContentDisposition(header, fallback) {
  const match = String(header || '').match(/filename="([^"]+)"/i);
  return match?.[1] || fallback;
}
