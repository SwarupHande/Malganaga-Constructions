import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/costs';

// Change a project's budget at any time. The old → new amount and the reason go to the activity log.
export default function BudgetForm({ project, onDone }) {
  const { dispatch } = useApp();
  const [budget, setBudget] = useState(String(project.budget ?? ''));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const amount = Number(budget);
  const changed = amount !== project.budget;
  const diff = amount - project.budget;

  function handleSubmit(e) {
    e.preventDefault();
    if (!budget || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a budget greater than zero.');
      return;
    }
    if (!changed) {
      onDone();
      return;
    }
    dispatch({
      type: 'UPDATE_PROJECT_BUDGET',
      payload: { projectId: project.id, budget: amount, reason: reason.trim() },
    });
    onDone();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}

      <p className="muted">Current budget: <strong>{formatINR(project.budget)}</strong></p>

      <label className="field">
        <span>New budget ({'₹'})</span>
        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          autoFocus
        />
      </label>
      {changed && amount > 0 && (
        <p className="muted">
          {formatINR(amount)} ({diff > 0 ? '+' : '−'}{formatINR(Math.abs(diff))})
        </p>
      )}

      <label className="field">
        <span>Reason (optional)</span>
        <input
          type="text"
          value={reason}
          maxLength={150}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Client added an extra floor"
        />
      </label>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save budget</button>
      </div>
    </form>
  );
}
