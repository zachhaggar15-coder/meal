import { Link } from 'react-router-dom';

const DEFAULT_SOURCES = [
  {
    label: 'NHS Eatwell Guide',
    url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
  },
  {
    label: 'NHS healthy weight guidance',
    url: 'https://www.nhs.uk/live-well/healthy-weight/',
  },
];

// Editorial provenance box.
//
// Deliberately has NO fallback date. A previous version defaulted every page to
// a single hardcoded "Last materially reviewed" date and, where that was
// missing, promoted the content-modification date to a review date. Both
// manufactured a freshness signal that was not true, so each kind of date is
// now shown separately and only when it genuinely exists:
//
//   published — when the page first went live
//   updated   — when its content last changed
//   reviewed  — when a person last checked the guidance itself
//   validated — when the plan data last passed the full automated gate
//
export default function TrustBox({
  published,
  updated,
  reviewed,
  validated,
  sources = DEFAULT_SOURCES,
  note = 'General nutrition information only. Calorie needs vary by body size, activity, health status and goals; this is not medical advice.',
}) {
  const stamps = [
    published && { label: 'Published', value: published },
    updated && { label: 'Updated', value: updated },
    reviewed && { label: 'Last editorial review', value: reviewed },
    validated && { label: 'Plan data last validated', value: validated },
  ].filter(Boolean);

  return (
    <aside className="trust-box" aria-label="Editorial and safety note">
      <div>
        <strong>Editorial Note</strong>
        {stamps.length > 0 && (
          <span className="trust-box-stamps">
            {stamps.map(stamp => (
              <span key={stamp.label} className="trust-box-stamp">
                {stamp.label}: {stamp.value}
              </span>
            ))}
          </span>
        )}
      </div>
      <p>{note}</p>
      <p className="trust-box-editorial">
        <Link to="/methodology">How we build plans and calculate nutrition</Link>
        {' · '}
        <Link to="/about">About our editorial approach</Link>
      </p>
      {sources?.length > 0 && (
        <p className="trust-box-sources">
          Sources:{' '}
          {sources.map((source, index) => (
            <span key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
              {index < sources.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}
    </aside>
  );
}

export { DEFAULT_SOURCES };
