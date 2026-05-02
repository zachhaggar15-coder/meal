import { useState } from 'react';

export default function EditPlanBox({ onEdit, loading, error }) {
  const [instruction, setInstruction] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!instruction.trim() || loading) return;
    onEdit(instruction.trim());
    setInstruction('');
  }

  function handleKeyDown(e) {
    // Ctrl/Cmd + Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(e);
  }

  return (
    <div className="edit-plan-box card">
      <h2 className="edit-plan-heading">Edit the plan</h2>
      <p className="edit-plan-hint">
        Tell the AI what to change — it will update your plan and keep everything else intact.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          className="edit-plan-input"
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'e.g. "Swap Monday\'s dinner for something vegetarian"\n"Replace all chicken with fish"\n"Make the breakfasts higher protein"'}
          rows={3}
          disabled={loading}
        />
        {error && <p className="edit-plan-error">{error}</p>}
        <button className="submit" type="submit" disabled={loading || !instruction.trim()}>
          {loading ? 'Updating plan…' : 'Update Plan'}
        </button>
      </form>
    </div>
  );
}
