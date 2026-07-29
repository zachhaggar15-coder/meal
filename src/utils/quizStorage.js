export const QUIZ_DRAFT_KEY = 'mealprep_quiz_draft_v1';
export const QUIZ_LAST_ANSWERS_KEY = 'mealprep_quiz_last_answers_v1';
export const QUIZ_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const ALLOWED_FIELDS = new Set([
  'goal',
  'diet',
  'supermarket',
  'calories',
  'budget',
  'effort',
  'macroMode',
  'macros',
]);

export function encodeQuizAnswers(answers) {
  const clean = normaliseQuizAnswers(answers);
  const json = JSON.stringify(clean);
  const encoded = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, 'utf8').toString('base64');
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeQuizAnswers(value) {
  const token = String(value || '').trim();
  if (!token || token.length > 4000 || !/^[A-Za-z0-9+/_=-]+$/.test(token)) return null;

  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = typeof atob === 'function'
      ? decodeURIComponent(escape(atob(padded)))
      : Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return normaliseQuizAnswers(parsed);
  } catch {
    return null;
  }
}

export function normaliseQuizAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const answers = {};
  for (const [key, item] of Object.entries(value)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (key === 'macros') {
      const macros = cleanMacros(item);
      if (macros) answers.macros = macros;
      continue;
    }
    if (typeof item !== 'string') continue;
    const text = item.trim().slice(0, 80);
    if (text) answers[key] = text;
  }
  return answers;
}

function cleanMacros(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const ranges = {
    protein: [50, 260],
    carbs: [50, 400],
    fats: [25, 140],
    fibre: [15, 70],
  };
  const macros = {};
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const number = Number(value[key]);
    if (!Number.isFinite(number)) continue;
    macros[key] = Math.max(min, Math.min(max, Math.round(number)));
  }
  return Object.keys(macros).length ? macros : null;
}
