import { useEffect, useState } from 'react';
import { track } from '../utils/analytics.js';
import {
  isPlanSaved,
  onPlanLibraryChange,
  toggleSavedPlan,
} from '../utils/planRetention.js';

export default function PlanSaveButton({
  plan,
  analyticsContext = {},
  className = '',
  ctaLocation = 'plan_action_bar',
}) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!plan?.route) return undefined;
    const sync = () => setSaved(isPlanSaved(plan.route));
    sync();
    return onPlanLibraryChange(sync);
  }, [plan?.route]);

  if (!plan?.route) return null;

  function handleSave() {
    const result = toggleSavedPlan(plan);
    if (!result.ok) {
      setMessage('Saving is unavailable in this browser.');
      return;
    }

    setSaved(result.saved);
    setMessage(result.saved ? 'Saved on this device.' : 'Removed from saved plans.');
    track[result.saved ? 'planSaved' : 'planUnsaved']({
      ...analyticsContext,
      cta_location: ctaLocation,
    });
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={handleSave}
        aria-pressed={saved}
      >
        {saved ? 'Saved' : 'Save plan'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{message}</span>
    </>
  );
}
