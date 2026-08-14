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

            {stats?.semanticQa && <SemanticQaSection semanticQa={stats.semanticQa} />}
            {stats?.analytics && <AnalyticsSection analytics={stats.analytics} />}
            {stats && <WaitlistSection stats={stats} />}
          </>
        )}
      </div>
    </>
  );
}

function SemanticQaSection({ semanticQa }) {
  if (!semanticQa.available || !semanticQa.latest) {
    return (
      <section className="admin-panel">
        <div className="admin-section-head">
          <h2>Plan Quality</h2>
          <p>The first weekly semantic meal-plan sample has not run yet.</p>
        </div>
      </section>
    );
  }

  const latest = semanticQa.latest;
  const severity = latest.severity || {};
  const coverage = semanticQa.coverage || {};
  const calibration = semanticQa.calibration || {};
  const calibrationRates = calibration.rates || {};

  return (
    <section className="admin-panel">
      <div className="admin-section-head">
        <h2>Plan Quality</h2>
        <p>
          A deterministic weekly sample checks complete plans for contradictions, coherence and shopping-list usability.
          Findings are review evidence only; a plan with a Medium flag has not "failed", and this process never rewrites plan content.
        </p>
      </div>

      <div className="admin-stats-grid admin-stats-grid--wide">
        <StatCard label="Latest sample" value={number(latest.sampleSize)} detail={dateOnly(latest.runAt)} />
        <StatCard label="Plans with no review flags" value={`${number(latest.plansWithoutFlagsRate)}%`} detail={`${number(latest.passed)} of ${number(latest.sampleSize)}`} />
        <StatCard label="Plans with review flags" value={number(latest.flagged)} detail={`of ${number(latest.sampleSize)} sampled`} />
        <StatCard label="Critical" value={number(severity.Critical)} />
        <StatCard label="High" value={number(severity.High)} />
        <StatCard label="Medium" value={number(severity.Medium)} />
        <StatCard label="Low" value={number(severity.Low)} />
        <StatCard label="Systemic patterns" value={number(latest.systemicIssueCount)} />
        <StatCard label="Plans ever sampled" value={number(coverage.plansEverSampled)} detail={`${number(coverage.percentageEverSampled)}% of ${number(coverage.totalPublishedPlans)}`} />
        <StatCard label="Sampled in 30 days" value={number(coverage.plansSampledLast30Days)} />
        <StatCard label="Model review" value={modelStatus(latest.model?.status)} detail={latest.model?.model || 'Deterministic local checks'} />
        <StatCard label="Calibration reviewed" value={number(calibration.reviewed)} detail={`${number(calibration.unreviewed)} awaiting a human label`} />
        <StatCard label="Useful-signal precision" value={percentOrPending(calibrationRates.usefulSignalPrecision)} detail={calibration.sufficientForOverallRates ? 'Human-labelled sample' : 'Needs at least 10 reviewed findings'} />
        <StatCard label="False-positive rate" value={percentOrPending(calibrationRates.falsePositiveRate)} detail="Uncertain labels are excluded" />
      </div>

      <DataTable
        title="Recent Findings"
        note="Open a route for manual verification. Medium means review suggested, not a failed plan. Assessment (was this a real issue?) and Status (workflow state) are independent — see scripts/qa-admin.js to update either. Run node scripts/qa-admin.js recheck <route> to re-run checks for one plan without changing it."
        rows={semanticQa.recentFindings || []}
        columns={[
          { key: 'severity', label: 'Severity' },
          { key: 'route', label: 'Plan', render: row => <a href={row.route} target="_blank" rel="noreferrer">{truncate(row.route, 54)}</a> },
          { key: 'affectedLocation', label: 'Location' },
          { key: 'issue', label: 'Evidence' },
          { key: 'scope', label: 'Scope' },
          { key: 'humanAssessment', label: 'Assessment' },
          { key: 'reviewStatus', label: 'Status' },
        ]}
        empty="No findings in the latest sample."
      />

      <DataTable
        title="Historical & Manual Findings"
        note="Every finding ever detected (auto) or added by hand (manual), kept after a fix rather than deleted. 'Latest recheck' reflects node scripts/qa-admin.js recheck <route>; 'Resolved' is set automatically when a recheck no longer detects it, but Status/Assessment stay under human control (node scripts/qa-admin.js set-status / set-assessment / add-finding). A row marked 'Systemic?' (node scripts/qa-admin.js flag-systemic <findingId>) is a single-page observation the owner believes may affect other plans and is worth a library-wide investigation."
        rows={semanticQa.findingsLedger || []}
        columns={[
          { key: 'source', label: 'Source' },
          { key: 'severity', label: 'Severity' },
          { key: 'route', label: 'Plan', render: row => <a href={row.route} target="_blank" rel="noreferrer">{truncate(row.route, 44)}</a> },
          { key: 'category', label: 'Category' },
          { key: 'affectedLocation', label: 'Location' },
          { key: 'evidence', label: 'Evidence', render: row => truncate(row.evidence, 90) },
          { key: 'firstDetectedAt', label: 'Detected', render: row => dateOnly(row.firstDetectedAt) },
          { key: 'humanAssessment', label: 'Assessment' },
          { key: 'status', label: 'Status' },
          { key: 'potentiallySystemic', label: 'Systemic?', render: row => (row.potentiallySystemic ? 'Yes' : '') },
          { key: 'lastRecheckResult', label: 'Latest recheck', render: row => row.lastRecheckResult || 'Not rechecked' },
          { key: 'resolvedAt', label: 'Resolved', render: row => dateOnly(row.resolvedAt) || '—' },
        ]}
        empty="No findings recorded yet."
      />

      <DataTable
        title="Potential Systemic Patterns"
        note="Patterns appear when at least two sampled plans share a likely cause. Medium patterns become engineering priorities only after human confirmation, repeated evidence or high-traffic impact."
        rows={semanticQa.systemicIssues || []}
        columns={[
          { key: 'patternKey', label: 'Pattern' },
          { key: 'severity', label: 'Severity' },
          { key: 'affectedSampledPlans', label: 'Sampled plans' },
          { key: 'likelySharedComponent', label: 'Likely shared component' },
          { key: 'firstDetected', label: 'First detected', render: row => dateOnly(row.firstDetected) },
          { key: 'mostRecentDetection', label: 'Latest', render: row => dateOnly(row.mostRecentDetection) },
        ]}
        empty="No repeated issue pattern in the latest sample."
      />

      <DataTable
        title="Coverage Trend"
        rows={semanticQa.trend || []}
        columns={[
          { key: 'runAt', label: 'Run', render: row => dateOnly(row.runAt) },
          { key: 'sampleSize', label: 'Sample' },
          { key: 'plansWithoutFlagsRate', label: 'No-flag share', render: row => `${number(row.plansWithoutFlagsRate)}%` },
          { key: 'criticalHigh', label: 'Critical / High' },
          { key: 'medium', label: 'Medium' },
          { key: 'cumulativeCoverage', label: 'Plans ever sampled' },
        ]}
      />

      <DataTable
        title="Human Calibration Sample"
        note="Labels live separately from generated QA history. Precision is deliberately withheld until the reviewed sample is large enough."
        rows={calibration.items || []}
        columns={[
          { key: 'route', label: 'Plan', render: row => <a href={row.route} target="_blank" rel="noreferrer">{truncate(row.route, 46)}</a> },
          { key: 'category', label: 'Category' },
          { key: 'detectorSeverity', label: 'Detector severity' },
          { key: 'evidence', label: 'Evidence' },
          { key: 'outcome', label: 'Human outcome' },
          { key: 'humanSeverity', label: 'Human severity' },
        ]}
        empty="No calibration sample has been prepared."
      />

      <DataTable
        title="Calibration Precision By Category"
        rows={calibration.byCategory || []}
        columns={[
          { key: 'name', label: 'Category' },
          { key: 'reviewed', label: 'Reviewed' },
          { key: 'precision', label: 'Useful-signal precision', render: row => percentOrPending(row.rates?.usefulSignalPrecision) },
          { key: 'falsePositiveRate', label: 'False-positive rate', render: row => percentOrPending(row.rates?.falsePositiveRate) },
        ]}
      />

      <div className="admin-grid-two">
        {Object.entries(semanticQa.breakdowns || {}).map(([facet, rows]) => (
          <DataTable
            key={facet}
            title={`Latest sample by ${facet}`}
            rows={rows}
            columns={[
              { key: 'name', label: 'Group' },
              { key: 'sampled', label: 'Sampled' },
              { key: 'flagged', label: 'Flagged' },
              { key: 'reviewRate', label: 'Flag rate', render: row => `${number(row.reviewRate)}%` },
            ]}
          />
        ))}
      </div>
    </section>
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
  const coreWebVitals = analytics.coreWebVitals || { summary: [], routes: [] };

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
        <StatCard label="Return visits" value={number(overview.returnVisits)} />
        <StatCard label="Plan saves" value={number(overview.savedPlanActions)} />
        <StatCard label="Shopping actions" value={number(overview.shoppingListUses)} />
      </div>

      <div className="admin-breakdowns admin-breakdowns--three">
        <Breakdown title="Entry source" data={analytics.entrySources || []} />
        <Breakdown title="Original intent" data={analytics.topEntryIntents || []} />
        <Breakdown title="Top pages" data={analytics.topPages || []} />
      </div>

      <DataTable
        title="Product Funnel"
        note="Named outcomes from the latest event sample. Session counts deduplicate repeated actions in one visit."
        rows={analytics.funnel || []}
        columns={[
          { key: 'stage', label: 'Stage' },
          { key: 'label', label: 'Outcome' },
          { key: 'events', label: 'Events' },
          { key: 'sessions', label: 'Sessions' },
        ]}
      />

      <div className="admin-section-head">
        <h3>Field Core Web Vitals</h3>
        <p>{coreWebVitals.note}</p>
      </div>
      <div className="admin-stats-grid">
        {(coreWebVitals.summary || []).map(metric => (
          <StatCard
            key={metric.name}
            label={`${metric.name} p75`}
            value={formatVital(metric)}
            detail={`${metric.rating.replace(/_/g, ' ')} - ${number(metric.samples)} samples`}
          />
        ))}
      </div>
      <DataTable
        title="Route-level vitals"
        note="Routes with INP are shown first so interaction delays can be investigated where visitors actually encounter them."
        rows={coreWebVitals.routes || []}
        columns={[
          { key: 'route', label: 'Route', render: row => truncate(row.route, 54) },
          { key: 'inp', label: 'INP p75', render: row => formatMilliseconds(row.inp) },
          { key: 'lcp', label: 'LCP p75', render: row => formatMilliseconds(row.lcp) },
          { key: 'cls', label: 'CLS p75', render: row => row.cls ?? '-' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'samples', label: 'Samples' },
        ]}
      />

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

function modelStatus(value) {
  return ({ available: 'Completed', partial: 'Partial', malformed: 'Malformed rejected', not_configured: 'Local only', unavailable: 'Local fallback' })[value] || 'Unknown';
}

function percentOrPending(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? `${number(value)}%`
    : 'Pending';
}

function formatVital(metric) {
  if (metric?.p75 === null || metric?.p75 === undefined) return 'Awaiting data';
  return metric.unit === 'score' ? number(metric.p75) : `${number(metric.p75)}ms`;
}

function formatMilliseconds(value) {
  return Number.isFinite(Number(value)) ? `${number(value)}ms` : '-';
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
