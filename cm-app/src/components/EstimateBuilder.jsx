import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { estimateItemTotal, formatINR } from '../utils/costs';

const CATEGORIES = ['Material', 'Labor', 'Overhead'];
let rowId = 1;
function makeRow(category = 'Material') {
  rowId += 1;
  return { rowKey: `row-${rowId}`, category, description: '', quantity: '', unitRate: '' };
}

export default function EstimateBuilder({ project, onDone }) {
  const { dispatch } = useApp();
  const [rows, setRows] = useState([makeRow('Material'), makeRow('Labor'), makeRow('Overhead')]);

  function updateRow(key, field, value) {
    setRows((rs) => rs.map((r) => (r.rowKey === key ? { ...r, [field]: value } : r)));
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
        quantity: Number(r.quantity),
        unitRate: Number(r.unitRate) || 0,
      }));
    if (cleanItems.length === 0) return;
    dispatch({ type: 'ADD_ESTIMATE_VERSION', payload: { projectId: project.id, items: cleanItems } });
    onDone();
  }

  return (
    <form className="estimate-builder" onSubmit={handleSubmit}>
      <div className="table-wrap">
        <table className="table table--estimate">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit rate</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rowKey}>
                <td>
                  <select value={r.category} onChange={(e) => updateRow(r.rowKey, 'category', e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="e.g. Cement (OPC 43)"
                    value={r.description}
                    onChange={(e) => updateRow(r.rowKey, 'description', e.target.value)}
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
