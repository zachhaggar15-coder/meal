export default function ShoppingList({ list, price }) {
  if (!list) return null;
  const groups = Object.entries(list).filter(
    ([, items]) => Array.isArray(items) && items.length > 0
  );

  if (groups.length === 0 && !price?.total) return null;

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Shopping list</h2>
      <div className="shop-grid">
        {groups.map(([group, items]) => (
          <div key={group} className="shop-group">
            <h4>{group}</h4>
            <ul>
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
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
