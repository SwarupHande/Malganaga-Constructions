import { useState } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = ['gray', 'blue', 'amber', 'indigo', 'teal', 'green', 'red', 'purple'];

export default function StatusManager() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');

  function addStatus(e) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'ADD_STATUS', payload: { name: name.trim(), color } });
    setName('');
  }

  return (
    <div className="status-manager">
      <p className="muted">
        Reorder the construction stages projects move through, or add a new one. Stages in use by a
        project can't be deleted.
      </p>
      <ul className="status-manager__list">
        {state.statuses.map((s, i) => (
          <li key={s.id} className="status-manager__row">
            <span className={`dot dot--${s.color}`} />
            <span className="status-manager__name">{s.name}</span>
            <div className="status-manager__row-actions">
              <button
                className="icon-btn"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => dispatch({ type: 'REORDER_STATUS', payload: { index: i, direction: -1 } })}
              >
                &uarr;
              </button>
              <button
                className="icon-btn"
                aria-label="Move down"
                disabled={i === state.statuses.length - 1}
                onClick={() => dispatch({ type: 'REORDER_STATUS', payload: { index: i, direction: 1 } })}
              >
                &darr;
              </button>
              <button
                className="icon-btn icon-btn--danger"
                aria-label="Delete status"
                onClick={() => dispatch({ type: 'DELETE_STATUS', payload: { id: s.id } })}
              >
                &times;
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form className="status-manager__add" onSubmit={addStatus}>
        <input
          type="text"
          placeholder="New stage name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {COLORS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Add</button>
      </form>
    </div>
  );
}
