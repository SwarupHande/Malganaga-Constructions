import { useState } from 'react';
import { useApp } from '../context/AppContext';

const ROLES = ['Site Engineer', 'Site Supervisor', 'Finishing Supervisor', 'Project Manager', 'Contractor'];

export default function MemberForm({ onDone }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({ name: '', role: ROLES[0], phone: '' });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    dispatch({
      type: 'ADD_MEMBER',
      payload: { name: form.name.trim(), role: form.role, phone: form.phone.trim() },
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
          placeholder="e.g. Ramesh Patil"
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
          <span>Phone (optional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 98220 41537"
          />
        </label>
      </div>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Add member</button>
      </div>
    </form>
  );
}
