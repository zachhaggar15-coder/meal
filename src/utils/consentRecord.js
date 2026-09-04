export const CONSENT_RECORD_VERSION = 1;
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const OPEN_PRIVACY_CHOICES_EVENT = 'mealprep:open-privacy-choices';

const VALID_CHOICES = new Set(['granted', 'denied']);

export function readConsentRecord(storage, key, { now = Date.now() } = {}) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return 'unset';

    // Migrate the original string-only format in place. `updatedAt` records
    // when the legacy choice was brought into the auditable schema, rather
    // than pretending we know when the old decision was first made.
    if (VALID_CHOICES.has(raw)) {
      writeConsentRecord(storage, key, raw, { now, migratedFrom: 'legacy' });
      return raw;
    }

    const record = JSON.parse(raw);
    if (
      record?.version !== CONSENT_RECORD_VERSION
      || !VALID_CHOICES.has(record?.choice)
      || !isCurrentTimestamp(record?.updatedAt, now)
    ) {
      return 'unset';
    }

    return record.choice;
  } catch {
    return 'unset';
  }
}

export function writeConsentRecord(
  storage,
  key,
  choice,
  { now = Date.now(), migratedFrom } = {},
) {
  const normalisedChoice = choice === 'granted' ? 'granted' : 'denied';
  const record = {
    choice: normalisedChoice,
    version: CONSENT_RECORD_VERSION,
    updatedAt: new Date(now).toISOString(),
  };

  if (migratedFrom) record.migratedFrom = migratedFrom;
  storage.setItem(key, JSON.stringify(record));
  return record;
}

function isCurrentTimestamp(value, now) {
  const savedAt = Date.parse(value);
  if (!Number.isFinite(savedAt)) return false;
  const age = now - savedAt;
  return age >= 0 && age <= CONSENT_MAX_AGE_MS;
}
