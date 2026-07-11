export function isCountUnit(unit) {
  return [
    'biscuit', 'biscuits', 'cake', 'cakes', 'clove', 'cloves', 'cracker', 'crackers',
    'date', 'dates', 'egg', 'eggs', 'fillet', 'fillets', 'leaf', 'leaves', 'pack',
    'packs', 'pitta', 'pittas', 'rasher', 'rashers', 'roll', 'rolls', 'sausage',
    'sausages', 'scoop', 'scoops', 'slice', 'slices', 'stick', 'sticks', 'stalk',
    'stalks', 'tin', 'tins', 'tortilla', 'tortillas', 'wrap', 'wraps',
  ].includes(String(unit || '').toLowerCase());
}
