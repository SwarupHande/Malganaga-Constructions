import { useState } from 'react';
import { useApp } from '../context/AppContext';

const ROLES = ['Mason', 'Helper', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 'Site Supervisor'];

export default function WorkerForm({ onDone }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({ name: '', role: ROLES[0], dailyRate: '' });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Worker name is required.');
      return;
    }
    if (!form.dailyRate || Number(form.dailyRate) <= 0) {
      setError('Enter a daily rate greater than zero.');
      return;
    }
    dispatch({
      type: 'ADD_WORKER',
      payload: { name: form.name.trim(), role: form.role, dailyRate: Number(form.dailyRate) },
    });
    onDone();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          autoFocus
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Vikram Salunkhe"
        />
      </label>
      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Role</span>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Daily rate ({'\u20B9'})</span>
          <input
            type="number"
            min="0"
            value={form.dailyRate}
            onChange={(e) => setForm((f) => ({ ...f, dailyRate: e.target.value }))}
            placeholder="e.g. 700"
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Add worker</button>
      </div>
    </form>
  );
}
