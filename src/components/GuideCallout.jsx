import { Link } from 'react-router-dom';

export const GUIDE_CALLOUT_CLICK_EVENT = 'guide_callout_clicked';

// A single in-article pointer to the next page a reader needs, placed at the
// moment the article has answered their question. Links at the top or in the
// related list are easy to skip; this one sits where the decision happens.
export default function GuideCallout({ callout, sourcePage, placement }) {
  if (!callout?.to) return null;

  return (
    <aside className="guide-callout" aria-label={callout.eyebrow || 'Next step'}>
      {callout.eyebrow && <strong className="guide-callout__eyebrow">{callout.eyebrow}</strong>}
      {callout.text && <p>{callout.text}</p>}
      <Link
        to={callout.to}
        className="guide-callout__link"
        data-event={GUIDE_CALLOUT_CLICK_EVENT}
        data-source-page={sourcePage}
        data-placement={placement}
        data-target-route={callout.to}
      >
        {callout.label} →
      </Link>
    </aside>
  );
}
