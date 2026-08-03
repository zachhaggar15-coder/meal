const THRESHOLDS = Object.freeze({
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
});

/**
 * Collect navigation-scoped, real-user Core Web Vitals with browser-native
 * PerformanceObserver APIs. The caller decides where and when to send them.
 */
export function observeWebVitals(report, { path = '/' } = {}) {
  if (
    typeof window === 'undefined'
    || typeof performance === 'undefined'
    || typeof PerformanceObserver === 'undefined'
    || typeof report !== 'function'
  ) {
    return { flush() {}, disconnect() {} };
  }

  const metrics = new Map();
  const observers = [];
  const interactionDurations = new Map();
  const supported = new Set(PerformanceObserver.supportedEntryTypes || []);
  const navigation = performance.getEntriesByType('navigation')[0];
  const navigationType = navigation?.type || 'navigate';
  const metricId = `${Math.round(performance.timeOrigin || Date.now())}`;
  let clsValue = 0;
  let finished = false;

  if (navigation && Number.isFinite(navigation.responseStart)) {
    setMetric('TTFB', Math.max(0, navigation.responseStart));
  }

  observe('paint', entries => {
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) setMetric('FCP', fcp.startTime);
  });

  observe('largest-contentful-paint', entries => {
    const last = entries[entries.length - 1];
    if (last) setMetric('LCP', last.startTime);
  });

  observe('layout-shift', entries => {
    for (const entry of entries) {
      if (!entry.hadRecentInput) clsValue += entry.value;
    }
    setMetric('CLS', clsValue);
  });

  observe('event', entries => {
    for (const entry of entries) {
      if (!entry.interactionId || !Number.isFinite(entry.duration)) continue;
      interactionDurations.set(
        entry.interactionId,
        Math.max(interactionDurations.get(entry.interactionId) || 0, entry.duration),
      );
    }
    const durations = [...interactionDurations.values()].sort((left, right) => right - left);
    if (!durations.length) return;
    const interactionCount = Number(performance.interactionCount) || interactionDurations.size;
    const p98Index = Math.min(durations.length - 1, Math.floor(interactionCount / 50));
    setMetric('INP', durations[p98Index]);
  }, { durationThreshold: 40 });

  return {
    flush(reason = 'page_exit') {
      if (finished) return;
      finished = true;
      for (const metric of metrics.values()) {
        report({
          path,
          metric_name: metric.name,
          metric_value: roundMetric(metric.name, metric.value),
          metric_unit: metric.name === 'CLS' ? 'score' : 'ms',
          metric_rating: rateMetric(metric.name, metric.value),
          metric_id: `${metricId}-${metric.name.toLowerCase()}`,
          navigation_type: navigationType,
          final_reason: reason,
        });
      }
      disconnect();
    },
    disconnect,
  };

  function setMetric(name, value) {
    if (!Number.isFinite(value) || value < 0) return;
    metrics.set(name, { name, value });
  }

  function observe(type, handler, extraOptions = {}) {
    if (!supported.has(type)) return;
    try {
      const observer = new PerformanceObserver(list => handler(list.getEntries()));
      observer.observe({ type, buffered: true, ...extraOptions });
      observers.push(observer);
    } catch {
      // Older browsers can advertise an entry type while rejecting newer
      // observer options. Missing metrics remain explicit in the dashboard.
    }
  }

  function disconnect() {
    for (const observer of observers) observer.disconnect();
    observers.length = 0;
  }
}

export function rateMetric(name, value) {
  const thresholds = THRESHOLDS[name];
  if (!thresholds || !Number.isFinite(Number(value))) return 'unknown';
  if (Number(value) <= thresholds[0]) return 'good';
  if (Number(value) <= thresholds[1]) return 'needs_improvement';
  return 'poor';
}

function roundMetric(name, value) {
  return name === 'CLS'
    ? Math.round(value * 1000) / 1000
    : Math.round(value);
}

export const CORE_WEB_VITAL_NAMES = Object.freeze(['LCP', 'INP', 'CLS']);
