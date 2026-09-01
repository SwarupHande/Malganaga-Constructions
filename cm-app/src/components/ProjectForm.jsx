import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LOCATIONS, DEFAULT_LOCATION, MANAGERS } from '../data/seedData';

const STATES = Object.keys(LOCATIONS);

export default function ProjectForm({ onDone }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    name: '',
    description: '',
    state: DEFAULT_LOCATION.state,
    district: DEFAULT_LOCATION.district,
    taluka: DEFAULT_LOCATION.taluka,
    village: DEFAULT_LOCATION.village,
    startDate: new Date().toISOString().slice(0, 10),
    budget: '',
    statusId: state.statuses[0]?.id || '',
    manager: MANAGERS[0],
  });
  const [error, setError] = useState('');

  const districts = Object.keys(LOCATIONS[form.state] || {});
  const talukas = LOCATIONS[form.state]?.[form.district] || [];

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'state') {
        const firstDistrict = Object.keys(LOCATIONS[value] || {})[0] || '';
        next.district = firstDistrict;
        next.taluka = LOCATIONS[value]?.[firstDistrict]?.[0] || '';
      }
      if (field === 'district') {
        next.taluka = LOCATIONS[f.state]?.[value]?.[0] || '';
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!form.budget || Number(form.budget) <= 0) {
      setError('Enter a budget greater than zero.');
      return;
    }
    dispatch({
      type: 'ADD_PROJECT',
      payload: {
        name: form.name.trim(),
        description: form.description.trim(),
        location: {
          state: form.state,
          district: form.district,
          taluka: form.taluka,
          village: form.village.trim() || 'Not specified',
        },
        startDate: form.startDate,
        budget: Number(form.budget),
        statusId: form.statusId,
        manager: form.manager,
      },
    });
    onDone();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}

      <label className="field">
        <span>Project name</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Green Acres Villa"
          autoFocus
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="e.g. 3BHK bungalow with garden"
        />
      </label>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>State</span>
          <select value={form.state} onChange={(e) => update('state', e.target.value)}>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>District</span>
          <select value={form.district} onChange={(e) => update('district', e.target.value)}>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Taluka</span>
          <select value={form.taluka} onChange={(e) => update('taluka', e.target.value)}>
            {talukas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Village</span>
          <input
            type="text"
            value={form.village}
            onChange={(e) => update('village', e.target.value)}
            placeholder="e.g. Sus"
          />
        </label>
      </div>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Start date</span>
          <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
        </label>
        <label className="field">
          <span>Budget ({'\u20B9'})</span>
          <input
            type="number"
            min="0"
            value={form.budget}
            onChange={(e) => update('budget', e.target.value)}
            placeholder="e.g. 4200000"
          />
        </label>
      </div>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Site manager</span>
          <select value={form.manager} onChange={(e) => update('manager', e.target.value)}>
            {MANAGERS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Initial status</span>
          <select value={form.statusId} onChange={(e) => update('statusId', e.target.value)}>
            {state.statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Create project</button>
      </div>
    </form>
  );
}
