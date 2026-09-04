function splitWeeklyDetail(value) {
  const text = String(value || '').trim();
  if (!text) return { weekly: '', detail: '' };

  const existingWeek = text.match(/^(.*?(?:per\s+week|\/\s*week))\s*(.*)$/i);
  if (existingWeek) {
    return {
      weekly: existingWeek[1].replace(/\/\s*week/i, '/week').trim(),
      detail: existingWeek[2].trim(),
    };
  }

  return { weekly: `${text}/week`, detail: '' };
}

export function formatWeeklyPrice(value) {
  const { weekly, detail } = splitWeeklyDetail(value);
  if (!weekly) return '';
  return detail ? `${weekly} ${detail}` : weekly;
}

export function formatWeeklyPriceEstimate(value) {
  const { weekly, detail } = splitWeeklyDetail(value);
  if (!weekly) return '';
  if (/\bestimate\b/i.test(`${weekly} ${detail}`)) return formatWeeklyPrice(value);
  return detail ? `${weekly} estimate ${detail}` : `${weekly} estimate`;
}
