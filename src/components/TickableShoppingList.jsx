import { useEffect, useMemo, useState } from 'react';
import { track } from '../utils/analytics.js';
import { ensureSavedPlan, readPlanProgress, writePlanProgress } from '../utils/planRetention.js';

export default function TickableShoppingList({
  list,
  planRoute,
  planReference,
  analyticsContext = {},
  gridClassName,
  groupClassName,
  groupHeadingClassName = '',
  listClassName = '',
  groupLabel = value => value,
}) {
  const [checkedItems, setCheckedItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const [autoSaved, setAutoSaved] = useState(false);
  const groups = useMemo(() => Object.entries(list || {}).filter(([, items]) => (
    Array.isArray(items) && items.length > 0
  )), [list]);
  const validKeys = useMemo(() => new Set(groups.flatMap(([group, items]) => (
    items.map((_, index) => itemKey(group, index))
  ))), [groups]);
  const checked = checkedItems.filter(key => validKeys.has(key));
  const total = validKeys.size;

  useEffect(() => {
    setReady(false);
    const progress = readPlanProgress(planRoute);
    setCheckedItems(progress?.checkedItems || []);
    setReady(true);
    if (progress?.checkedItems?.length) {
      track.shoppingListResumed({
        ...analyticsContext,
        checked_count: progress.checkedItems.length,
        cta_location: 'shopping_list',
      });
    }
  }, [analyticsContext, planRoute]);

  function toggleItem(key, nextChecked) {
    const next = nextChecked
      ? [...new Set([...checkedItems, key])]
      : checkedItems.filter(item => item !== key);
    setCheckedItems(next);

    // Ticking the first item is the point a shopping list becomes this week's
    // shop. Progress was already stored, but in its own record keyed by route -
    // so someone could tick half a list, close the tab, and have no way back to
    // the plan from Saved Plans. The first tick now puts it in the library.
    // Only the first: ensureSavedPlan never removes, and re-saving on every
    // later tick would undo a deliberate un-save.
    if (nextChecked && checked.length === 0 && planReference) {
      const { added } = ensureSavedPlan(planReference);
      if (added) {
        setAutoSaved(true);
        track.planSaved({
          ...analyticsContext,
          cta_location: 'shopping_list_first_tick',
          save_trigger: 'auto',
        });
      }
    }
    const stored = writePlanProgress(planRoute, { checkedItems: next });
    setStorageMessage(stored ? '' : 'Ticks will reset when this page closes.');
    track.shoppingItemToggled({
      ...analyticsContext,
      checked: nextChecked,
      checked_count: next.filter(item => validKeys.has(item)).length,
      item_count: total,
      cta_location: 'shopping_list',
    });
  }

  function clearTicks() {
    setCheckedItems([]);
    const stored = writePlanProgress(planRoute, { checkedItems: [] });
    setStorageMessage(stored ? 'All ticks cleared.' : 'Ticks cleared for this page view.');
    track.shoppingListCleared({
      ...analyticsContext,
      item_count: total,
      cta_location: 'shopping_list',
    });
  }

  return (
    <>
      <div className="shopping-progress" aria-live="polite">
        <span>
          <strong>{checked.length}</strong> of {total} items ticked
          <small>{autoSaved ? 'Saved on this device and added to your plans' : 'Saved on this device'}</small>
        </span>
        {checked.length > 0 && (
          <button type="button" onClick={clearTicks}>Clear ticks</button>
        )}
      </div>
      {storageMessage && <p className="shopping-storage-message" role="status">{storageMessage}</p>}
      <div className={gridClassName}>
        {groups.map(([group, items]) => (
          <section className={groupClassName} key={group} aria-labelledby={`shopping-${safeId(group)}`}>
            <h3 id={`shopping-${safeId(group)}`} className={groupHeadingClassName}>
              {groupLabel(group)}
            </h3>
            <ul className={listClassName}>
              {items.map((item, index) => {
                const key = itemKey(group, index);
                const isChecked = checkedItems.includes(key);
                return (
                  <li className={isChecked ? 'shopping-item shopping-item--checked' : 'shopping-item'} key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={event => toggleItem(key, event.target.checked)}
                        disabled={!ready}
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function itemKey(group, index) {
  return `${String(group || '').replace(/:/g, '-').slice(0, 120)}:${index}`;
}

function safeId(value) {
  return String(value || 'group').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
