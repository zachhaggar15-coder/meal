// The release schedule as a file: dist/pinterest/schedule.json.
//
// The build writes it (scripts/generate-pinterest-assets.js) and
// api/pinterest-feed.js reads it back to serve each feed as it stands at the
// moment Pinterest asks. Only what the RSS writer needs is kept, so the file
// stays small and the function never has to load the site's content data.
//
// Bump PINTEREST_SCHEDULE_VERSION whenever the shape changes: the function
// refuses a file it does not understand rather than serving a broken feed.

export const PINTEREST_SCHEDULE_FILENAME = 'schedule.json';
export const PINTEREST_SCHEDULE_VERSION = 1;

const FEED_FIELDS = ['key', 'feed', 'board', 'title', 'description'];

function pick(source, fields) {
  return Object.fromEntries(fields.map(field => [field, source[field] ?? null]));
}

export function scheduleDocument({ records, feeds, generatedAt = new Date() }) {
  return {
    version: PINTEREST_SCHEDULE_VERSION,
    generatedAt: new Date(generatedAt).toISOString(),
    feeds: feeds.map(feed => pick(feed, FEED_FIELDS)),
    records: records.map(record => ({
      id: record.id,
      boardKey: record.boardKey,
      variant: record.variant,
      guid: record.guid,
      title: record.title,
      description: record.description,
      link: record.link,
      releaseAt: record.releaseAt,
      image: record.image,
    })),
  };
}

/**
 * Check a parsed schedule file. Returns the list of problems, empty when it is
 * safe to serve from.
 */
export function scheduleProblems(schedule) {
  if (!schedule || typeof schedule !== 'object') return ['schedule is not an object'];
  const problems = [];
  if (schedule.version !== PINTEREST_SCHEDULE_VERSION) {
    problems.push(`schedule version ${schedule.version} is not ${PINTEREST_SCHEDULE_VERSION}`);
  }
  if (!Array.isArray(schedule.feeds) || !schedule.feeds.length) problems.push('schedule has no feeds');
  if (!Array.isArray(schedule.records)) problems.push('schedule has no records');
  for (const record of Array.isArray(schedule.records) ? schedule.records : []) {
    if (!record?.guid || !record?.link || Number.isNaN(Date.parse(record?.releaseAt))) {
      problems.push(`record ${record?.id || '(no id)'} is incomplete`);
      break;
    }
  }
  return problems;
}

/**
 * The feed definition for a requested filename, or null. Only filenames the
 * schedule itself lists are served, so the URL cannot name anything else.
 */
export function feedForFilename(schedule, filename) {
  return schedule.feeds.find(feed => feed.feed === filename) || null;
}
