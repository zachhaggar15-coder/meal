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

export default function TrustBox({
  reviewed = '17 June 2026',
  sources = DEFAULT_SOURCES,
  note = 'General nutrition information only. Calorie needs vary by body size, activity, health status and goals; this is not medical advice.',
}) {
  return (
    <aside className="trust-box" aria-label="Editorial and safety note">
      <div>
        <strong>Editorial note</strong>
        <span>Last materially reviewed: {reviewed}</span>
      </div>
      <p>{note}</p>
      <p className="trust-box-editorial">
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
