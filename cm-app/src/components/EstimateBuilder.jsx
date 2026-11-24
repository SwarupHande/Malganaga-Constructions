import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { estimateItemTotal, formatINR, COST_CATEGORIES, CATEGORY_HINTS, costItems } from '../utils/costs';
import { ESTIMATE_CATALOG } from '../data/materials';
import SuggestInput from './SuggestInput';

const CATEGORIES = COST_CATEGORIES;
let rowId = 1;
function makeRow(category = 'Material') {
  rowId += 1;
  return { rowKey: `row-${rowId}`, category, description: '', unit: '', quantity: '', unitRate: '' };
}

const isCatalogItem = (category, description) =>
  (ESTIMATE_CATALOG[category] || []).some((o) => o.name === description);

// Rows pre-filled from an existing estimate version (used by "Edit").
function rowsFrom(estimate) {
  return costItems(estimate).map((it) => ({
    ...makeRow(it.category),
    description: it.description || '',
    unit: it.unit || '',
    quantity: String(it.quantity ?? ''),
    unitRate: String(it.unitRate ?? ''),
  }));
}

// `baseEstimate` (optional): start from this version's items. Saving always creates a NEW version,
// so the edited version stays in the history.
export default function EstimateBuilder({ project, onDone, baseEstimate = null }) {
  const { dispatch } = useApp();
  const [rows, setRows] = useState(() => {
    const fromBase = baseEstimate ? rowsFrom(baseEstimate) : [];
    return fromBase.length ? fromBase : [makeRow('Material'), makeRow('Labour'), makeRow('Overhead')];
  });

  function updateRow(key, field, value) {
    setRows((rs) => rs.map((r) => (r.rowKey === key ? { ...r, [field]: value } : r)));
  }
  // A catalogue item from the old category (e.g. "TMT Steel 12mm") doesn't belong in the new one,
  // so clear it; custom text the user typed is kept.
  function changeCategory(key, category) {
    setRows((rs) =>
      rs.map((r) => {
        if (r.rowKey !== key) return r;
        const clear = isCatalogItem(r.category, r.description);
        return { ...r, category, ...(clear ? { description: '', unit: '' } : {}) };
      })
    );
  }
  function addRow() {
    setRows((rs) => [...rs, makeRow('Material')]);
  }
  function removeRow(key) {
    setRows((rs) => rs.filter((r) => r.rowKey !== key));
  }

  const totalsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = rows
      .filter((r) => r.category === cat)
      .reduce((sum, r) => sum + estimateItemTotal(r), 0);
    return acc;
  }, {});
  const grandTotal = CATEGORIES.reduce((sum, cat) => sum + totalsByCategory[cat], 0);

  function handleSubmit(e) {
    e.preventDefault();
    const cleanItems = rows
      .filter((r) => r.description.trim() && Number(r.quantity) > 0)
      .map((r) => ({
        category: r.category,
        description: r.description.trim(),
        unit: r.unit.trim(),
        quantity: Number(r.quantity),
        unitRate: Number(r.unitRate) || 0,
      }));
    if (cleanItems.length === 0) return;
    dispatch({
      type: 'ADD_ESTIMATE_VERSION',
      payload: {
        projectId: project.id,
        items: cleanItems,
        ...(baseEstimate ? { basedOnVersion: baseEstimate.version } : {}),
      },
    });
    onDone();
  }

  return (
    <form className="estimate-builder" onSubmit={handleSubmit}>
      {baseEstimate && (
        <p className="cost-note">
          Editing version {baseEstimate.version}. Saving creates a new version — version {baseEstimate.version} is kept in the history.
        </p>
      )}
      <div className="table-wrap">
        <table className="table table--estimate">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit rate</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rowKey}>
                <td>
                  <select value={r.category} onChange={(e) => changeCategory(r.rowKey, e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <SuggestInput
                    value={r.description}
                    onChange={(v) => updateRow(r.rowKey, 'description', v)}
                    onSelect={(o) => updateRow(r.rowKey, 'unit', o.unit || '')}
                    options={ESTIMATE_CATALOG[r.category] || []}
                    placeholder={CATEGORY_HINTS[r.category]}
                    ariaLabel="Description"
                    allowOther
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="table__num-input"
                    min="0"
                    value={r.quantity}
                    onChange={(e) => updateRow(r.rowKey, 'quantity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="table__unit-input"
                    placeholder="Unit"
                    aria-label="Unit"
                    value={r.unit}
                    onChange={(e) => updateRow(r.rowKey, 'unit', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="table__num-input"
                    min="0"
                    value={r.unitRate}
                    onChange={(e) => updateRow(r.rowKey, 'unitRate', e.target.value)}
                  />
                </td>
                <td>{formatINR(estimateItemTotal(r))}</td>
                <td>
                  <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeRow(r.rowKey)} aria-label="Remove row">
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn btn--ghost btn--sm" onClick={addRow}>+ Add line item</button>

      <div className="estimate-builder__totals">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="estimate-builder__total-row">
            <span>{cat} subtotal</span>
            <strong>{formatINR(totalsByCategory[cat])}</strong>
          </div>
        ))}
        <div className="estimate-builder__total-row estimate-builder__total-row--grand">
          <span>Grand total</span>
          <strong>{formatINR(grandTotal)}</strong>
        </div>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save estimate version</button>
      </div>
    </form>
  );
}
