import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LOCATIONS } from '../data/seedData';

const STATES = Object.keys(LOCATIONS);

// Keep a saved value selectable even if it isn't in the location list (e.g. older data).
const withCurrent = (options, current) => (current && !options.includes(current) ? [current, ...options] : options);

// Inline editor for the "Project details" card. Stage and stage managers are edited elsewhere.
export default function ProjectDetailsForm({ project, onDone }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    name: project.name || '',
    description: project.description || '',
    startDate: project.startDate || '',
    budget: String(project.budget ?? ''),
    state: project.location?.state || '',
    district: project.location?.district || '',
    taluka: project.location?.taluka || '',
    village: project.location?.village || '',
  });
  const [error, setError] = useState('');

  const states = withCurrent(STATES, form.state);
  const districts = withCurrent(Object.keys(LOCATIONS[form.state] || {}), form.district);
  const talukas = withCurrent(LOCATIONS[form.state]?.[form.district] || [], form.taluka);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Changing state/district resets the levels below it to the first valid choice.
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
    if (!form.name.trim()) return setError('Project name is required.');
    const budget = Number(form.budget);
    if (!form.budget || !Number.isFinite(budget) || budget <= 0) return setError('Enter a budget greater than zero.');
    if (!form.startDate) return setError('Start date is required.');

    const location = {
      state: form.state,
      district: form.district,
      taluka: form.taluka,
      village: form.village.trim() || 'Not specified',
    };
    const next = {
      name: form.name.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      budget,
      location,
    };

    // Only send what actually changed.
    const changes = {};
    if (next.name !== project.name) changes.name = next.name;
    if (next.description !== (project.description || '')) changes.description = next.description;
    if (next.startDate !== project.startDate) changes.startDate = next.startDate;
    if (next.budget !== project.budget) changes.budget = next.budget;
    if (JSON.stringify(location) !== JSON.stringify({ state: project.location?.state, district: project.location?.district, taluka: project.location?.taluka, village: project.location?.village })) {
      changes.location = location;
    }

    if (Object.keys(changes).length > 0) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { projectId: project.id, changes } });
    }
    onDone();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}

      <label className="field">
        <span>Project name</span>
        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </label>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Start date</span>
          <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
        </label>
        <label className="field">
          <span>Budget ({'₹'})</span>
          <input type="number" min="1" inputMode="numeric" value={form.budget} onChange={(e) => update('budget', e.target.value)} />
        </label>
      </div>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>State</span>
          <select value={form.state} onChange={(e) => update('state', e.target.value)}>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field">
          <span>District</span>
          <select value={form.district} onChange={(e) => update('district', e.target.value)}>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="field-grid field-grid--2">
        <label className="field">
          <span>Taluka</span>
          <select value={form.taluka} onChange={(e) => update('taluka', e.target.value)}>
            {talukas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Village</span>
          <input type="text" value={form.village} onChange={(e) => update('village', e.target.value)} placeholder="e.g. Sus" />
        </label>
      </div>

      <p className="muted">Stage is changed from the dropdown at the top; stage managers from the Team page.</p>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}
