import { useState } from 'react';
import { track } from '../utils/analytics.js';

function buildListText(list, price) {
  const lines = ['SHOPPING LIST', '='.repeat(40)];
  for (const [group, items] of Object.entries(list)) {
    if (!Array.isArray(items) || items.length === 0) continue;
    lines.push(`\n${group.toUpperCase()}`);
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        let line = `• ${item.name}`;
        if (item.amount) line += ` — ${item.amount}`;
        if (item.packs) line += ` (${item.packs})`;
        lines.push(line);
      } else {
        lines.push(`• ${item}`);
      }
    }
  }
  if (price?.total) lines.push(`\nEstimated cost: ${price.total}`);
  if (price?.notes) lines.push(price.notes);
  lines.push('\nGenerated at mealprep.org.uk');
  return lines.join('\n');
}

export default function ShoppingList({ list, price }) {
  const [copied, setCopied] = useState(false);

  if (!list) return null;
  const groups = Object.entries(list).filter(
    ([, items]) => Array.isArray(items) && items.length > 0
  );

  if (groups.length === 0 && !price?.total) return null;

  async function copyList() {
    try {
      await navigator.clipboard.writeText(buildListText(list, price));
      setCopied(true);
      track.shoppingListCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <section className="card">
      <div className="plan-actions" style={{ marginBottom: '12px' }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Shopping list</h2>
        <div className="plan-action-btns">
          <button className="action-btn" onClick={copyList}>
            {copied ? '✓ Copied!' : 'Copy list'}
          </button>
        </div>
      </div>

      <div className="shop-grid">
        {groups.map(([group, items]) => (
          <div key={group} className="shop-group">
            <h4>{group}</h4>
            <ul>
              {items.map((item, i) =>
                typeof item === 'object' && item !== null ? (
                  <li key={i}>
                    <span className="shop-item-name">{item.name}</span>
                    {item.amount && <span className="shop-item-amount"> — {item.amount}</span>}
                    {item.packs && <span className="shop-item-packs"> ({item.packs})</span>}
                  </li>
                ) : (
                  <li key={i}>{item}</li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
      {price && (price.total || price.notes) && (
        <div className="price">
          <strong>Estimated weekly cost:</strong> {price.total || '—'}
          {price.notes && (
            <p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>{price.notes}</p>
          )}
        </div>
      )}
    </section>
  );
}
