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
  const clsElements = new Set();
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
    if (last) setMetric('LCP', last.startTime, { metric_element: describeElement(last.element) });
  });

  observe('layout-shift', entries => {
    for (const entry of entries) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        for (const source of entry.sources || []) {
          const label = describeElement(source.node);
          if (label) clsElements.add(label);
        }
      }
    }
    setMetric('CLS', clsValue, { metric_elements: [...clsElements].slice(0, 5).join(', ') });
  });

  observe('event', entries => {
    for (const entry of entries) {
      if (!entry.interactionId || !Number.isFinite(entry.duration)) continue;
      const current = interactionDurations.get(entry.interactionId);
      if (!current || entry.duration > current.duration) {
        interactionDurations.set(entry.interactionId, {
          duration: entry.duration,
          target: describeElement(entry.target),
          eventType: String(entry.name || '').slice(0, 30),
        });
      }
    }
    const interactions = [...interactionDurations.values()].sort((left, right) => right.duration - left.duration);
    if (!interactions.length) return;
    const interactionCount = Number(performance.interactionCount) || interactionDurations.size;
    const p98Index = Math.min(interactions.length - 1, Math.floor(interactionCount / 50));
    const selected = interactions[p98Index];
    setMetric('INP', selected.duration, {
      metric_element: selected.target,
      metric_event_type: selected.eventType,
    });
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
          ...metric.attribution,
        });
      }
      disconnect();
    },
    disconnect,
  };

  function setMetric(name, value, attribution = {}) {
    if (!Number.isFinite(value) || value < 0) return;
    metrics.set(name, { name, value, attribution });
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

function describeElement(element) {
  if (!element || typeof element !== 'object') return '';
  const tag = String(element.tagName || '').toLowerCase();
  if (!tag) return '';
  const id = String(element.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  const classes = typeof element.className === 'string'
    ? element.className.split(/\s+/).filter(Boolean).slice(0, 3)
      .map(value => value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30))
      .filter(Boolean)
    : [];
  return `${tag}${id ? `#${id}` : ''}${classes.map(value => `.${value}`).join('')}`.slice(0, 140);
}
