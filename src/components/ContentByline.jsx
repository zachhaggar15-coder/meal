import { Link } from 'react-router-dom';
import { SITE_AUTHOR_NAME } from '../constants/site.js';
import { formatContentDate } from '../utils/contentDates.js';

// Byline for editorial pages.
//
// The previous wording said "Written and reviewed by … Last materially
// reviewed: <date>" on every page, using the content-modification date — or a
// single hardcoded date — where no review had actually taken place. This
// version states only what is true for the page in front of the reader:
// publication and update dates always, and an editorial-review date only where
// one genuinely exists.
export default function ContentByline({ record = {}, verb = 'Written' }) {
  const published = formatContentDate(record.published);
  const updated = formatContentDate(record.modified);
  const reviewed = formatContentDate(record.reviewed);

  const parts = [];
  if (published) parts.push(`Published ${published}`);
  if (updated && updated !== published) parts.push(`updated ${updated}`);
  if (reviewed) parts.push(`last editorial review ${reviewed}`);

  return (
    <p className="content-byline">
      {verb} by <Link to="/about">{SITE_AUTHOR_NAME}</Link>.
      {parts.length > 0 && ` ${parts.join(', ')}.`}{' '}
      <Link to="/methodology">How we produce this content</Link>.
    </p>
  );
}
