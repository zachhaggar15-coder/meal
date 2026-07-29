const SAVED_PLANS_KEY = 'mealprep_saved_plans_v1';
const RECENT_PLANS_KEY = 'mealprep_recent_plans_v1';
const PLAN_PROGRESS_KEY = 'mealprep_plan_progress_v1';
const LIBRARY_EVENT = 'mealprep:plan-library-changed';
const MAX_SAVED_PLANS = 24;
const MAX_RECENT_PLANS = 8;
const MAX_PROGRESS_RECORDS = 32;
const MAX_HOUSEHOLD_MEMBERS = 6;
const HOUSEHOLD_MODES = ['same', 'couple', 'family', 'custom'];
const MAX_RECORD_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const RETURN_VIEW_GAP_MS = 4 * 60 * 60 * 1000;

export function buildPlanReference({
  route,
  slug,
  title,
  supermarket,
  goal,
  calories,
  protein,
  priceEstimate,
}) {
  const cleanRoute = normalisePlanRoute(route);
  if (!cleanRoute) return null;

  return {
    route: cleanRoute,
    slug: cleanText(slug, 180),
    title: cleanText(title, 220) || 'Saved meal plan',
    supermarket: cleanText(supermarket, 80),
    goal: cleanText(goal, 120),
    calories: cleanNumber(calories, 800, 5000),
    protein: cleanNumber(protein, 0, 500),
    priceEstimate: cleanText(priceEstimate, 80),
  };
}

export function getPlanLibrary() {
  return {
    saved: readPlanList(SAVED_PLANS_KEY),
    recent: readPlanList(RECENT_PLANS_KEY),
  };
}

export function isPlanSaved(route) {
  const cleanRoute = normalisePlanRoute(route);
  return Boolean(cleanRoute && readPlanList(SAVED_PLANS_KEY).some(item => item.route === cleanRoute));
}

export function recordPlanView(reference) {
  const clean = cleanPlanReference(reference);
  if (!clean) return { ok: false, isReturn: false, viewCount: 0 };

  const recent = readPlanList(RECENT_PLANS_KEY);
  const previous = recent.find(item => item.route === clean.route);
  const now = Date.now();
  const isReturn = Boolean(previous?.lastViewedAt && now - previous.lastViewedAt >= RETURN_VIEW_GAP_MS);
  const next = {
    ...previous,
    ...clean,
    firstViewedAt: previous?.firstViewedAt || now,
    lastViewedAt: now,
    viewCount: previous
      ? Math.min(999, Math.max(1, Number(previous.viewCount) || 1) + (isReturn ? 1 : 0))
      : 1,
  };
  const result = writePlanList(RECENT_PLANS_KEY, [
    next,
    ...recent.filter(item => item.route !== clean.route),
  ].slice(0, MAX_RECENT_PLANS));

  if (result) dispatchLibraryChange();
  return {
    ok: result,
    isReturn,
    viewCount: next.viewCount,
  };
}

export function toggleSavedPlan(reference) {
  const clean = cleanPlanReference(reference);
  if (!clean) return { ok: false, saved: false };

  const saved = readPlanList(SAVED_PLANS_KEY);
  const exists = saved.some(item => item.route === clean.route);
  const next = exists
    ? saved.filter(item => item.route !== clean.route)
    : [{
        ...clean,
        savedAt: Date.now(),
        lastViewedAt: Date.now(),
      }, ...saved].slice(0, MAX_SAVED_PLANS);
  const ok = writePlanList(SAVED_PLANS_KEY, next);
  if (ok) dispatchLibraryChange();
  return { ok, saved: ok ? !exists : exists };
}

export function removeSavedPlan(route) {
  const cleanRoute = normalisePlanRoute(route);
  if (!cleanRoute) return false;
  const saved = readPlanList(SAVED_PLANS_KEY);
  const next = saved.filter(item => item.route !== cleanRoute);
  if (next.length === saved.length) return true;
  const ok = writePlanList(SAVED_PLANS_KEY, next);
  if (ok) dispatchLibraryChange();
  return ok;
}

export function readPlanProgress(route) {
  const cleanRoute = normalisePlanRoute(route);
  if (!cleanRoute) return null;

  const records = readProgressRecords();
  const record = records[cleanRoute];
  if (!record || !isCurrent(record.updatedAt)) return null;

  return {
    activeDayIdx: cleanInteger(record.activeDayIdx, 0, 6),
    householdMode: HOUSEHOLD_MODES.includes(record.householdMode)
      ? record.householdMode
      : undefined,
    householdMembers: cleanHouseholdMembers(record.householdMembers),
    checkedItems: cleanCheckedItems(record.checkedItems),
    updatedAt: cleanTimestamp(record.updatedAt),
  };
}

export function writePlanProgress(route, patch) {
  const cleanRoute = normalisePlanRoute(route);
  if (!cleanRoute || typeof window === 'undefined') return false;

  const records = readProgressRecords();
  const current = records[cleanRoute] || {};
  const next = {
    ...current,
    activeDayIdx: patch.activeDayIdx === undefined
      ? current.activeDayIdx
      : cleanInteger(patch.activeDayIdx, 0, 6),
    householdMode: patch.householdMode === undefined
      ? current.householdMode
      : (HOUSEHOLD_MODES.includes(patch.householdMode) ? patch.householdMode : undefined),
    householdMembers: patch.householdMembers === undefined
      ? current.householdMembers
      : cleanHouseholdMembers(patch.householdMembers),
    checkedItems: patch.checkedItems === undefined
      ? current.checkedItems
      : cleanCheckedItems(patch.checkedItems),
    updatedAt: Date.now(),
  };

  const entries = Object.entries({ ...records, [cleanRoute]: next })
    .filter(([, value]) => isCurrent(value?.updatedAt))
    .sort((left, right) => Number(right[1]?.updatedAt || 0) - Number(left[1]?.updatedAt || 0))
    .slice(0, MAX_PROGRESS_RECORDS);

  try {
    window.localStorage.setItem(PLAN_PROGRESS_KEY, JSON.stringify(Object.fromEntries(entries)));
    return true;
  } catch {
    return false;
  }
}

export function onPlanLibraryChange(handler) {
  if (typeof window === 'undefined') return () => {};

  const localListener = () => handler(getPlanLibrary());
  const storageListener = event => {
    if ([SAVED_PLANS_KEY, RECENT_PLANS_KEY].includes(event.key)) localListener();
  };
  window.addEventListener(LIBRARY_EVENT, localListener);
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(LIBRARY_EVENT, localListener);
    window.removeEventListener('storage', storageListener);
  };
}

function cleanPlanReference(value) {
  if (!value || typeof value !== 'object') return null;
  return buildPlanReference(value);
}

function readPlanList(key) {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(cleanStoredPlan)
      .filter(Boolean)
      .filter(item => isCurrent(item.savedAt || item.lastViewedAt || item.firstViewedAt))
      .slice(0, key === SAVED_PLANS_KEY ? MAX_SAVED_PLANS : MAX_RECENT_PLANS);
  } catch {
    return [];
  }
}

function cleanStoredPlan(value) {
  const reference = cleanPlanReference(value);
  if (!reference) return null;
  return {
    ...reference,
    savedAt: cleanTimestamp(value.savedAt),
    firstViewedAt: cleanTimestamp(value.firstViewedAt),
    lastViewedAt: cleanTimestamp(value.lastViewedAt),
    viewCount: cleanInteger(value.viewCount, 0, 999),
  };
}

function writePlanList(key, value) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readProgressRecords() {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PLAN_PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanHouseholdMembers(value) {
  if (!Array.isArray(value)) return undefined;
  const members = value.slice(0, MAX_HOUSEHOLD_MEMBERS).map((member, index) => ({
    id: cleanText(member?.id, 80) || `person-${index + 1}`,
    label: cleanText(member?.label, 40) || `Person ${index + 1}`,
    portionScale: cleanNumber(member?.portionScale, 0.25, 1.75) || 1,
  }));
  return members.length ? members : undefined;
}

function cleanCheckedItems(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map(item => cleanText(item, 180))
    .filter(item => /^[^:]{1,120}:\d{1,3}$/.test(item))
  )].slice(0, 300);
}

function normalisePlanRoute(value) {
  const route = String(value || '').trim().split(/[?#]/)[0].replace(/\/+$/, '');
  if (!/^\/(?:plans|meal-plan)\/[a-z0-9-]+$/i.test(route)) return '';
  return route.toLowerCase();
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength) || undefined;
}

function cleanNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cleanInteger(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cleanTimestamp(value) {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined;
}

function isCurrent(timestamp) {
  const value = Number(timestamp);
  return Number.isFinite(value) && value > Date.now() - MAX_RECORD_AGE_MS && value < Date.now() + 60_000;
}

function dispatchLibraryChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LIBRARY_EVENT));
}
