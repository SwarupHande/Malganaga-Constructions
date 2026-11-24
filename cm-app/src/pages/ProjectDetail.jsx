import { useState } from 'react'; // useMemo was only used by the disabled Workers tab
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
// import AttendanceSheet from '../components/AttendanceSheet';
import EstimateBuilder from '../components/EstimateBuilder';
import BudgetForm from '../components/BudgetForm';
import ProjectDetailsForm from '../components/ProjectDetailsForm';
import EstimateActions from '../components/EstimateActions';
import SuggestInput from '../components/SuggestInput';
import { ESTIMATE_CATALOG } from '../data/materials';
import {
  projectCostSummary,
  estimateItemTotal,
  costItems,
  formatINR,
  formatDMY,
  percent,
  COST_CATEGORIES,
  CATEGORY_HINTS,
  normalizeCategory,
} from '../utils/costs';
import { currentStageManager, stageManagerOf } from '../utils/team';

// Workers & Attendance tab disabled for now
const TABS = ['Overview', /* 'Workers & Attendance', */ 'Expenses', 'Payments Received', 'Estimate Cost'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState(TABS[0]);
  const [editingBudget, setEditingBudget] = useState(false);

  const project = state.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Project not found.</p>
          <Link to="/projects" className="link">Back to projects</Link>
        </div>
      </div>
    );
  }

  const status = state.statuses.find((s) => s.id === project.statusId);
  const manager = currentStageManager(project, state.team);
  const cost = projectCostSummary(project, {
    estimates: state.estimates,
    expenses: state.expenses,
  });
  const totalReceived = state.payments
    .filter((p) => p.projectId === project.id)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="page">
      <div className="detail-header">
        <div>
          <Link to="/projects" className="link link--back">&larr; All projects</Link>
          <h1>{project.name}</h1>
          <p className="detail-header__location">
            {project.location.village}, {project.location.taluka}, {project.location.district},{' '}
            {project.location.state}
          </p>
        </div>
        <label className="field field--inline detail-header__status">
          <span>Stage</span>
          <select
            value={project.statusId}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_PROJECT_STATUS',
                payload: { projectId: project.id, statusId: e.target.value },
              })
            }
          >
            {state.statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="stat-grid">
        <MiniStat
          label="Budget"
          value={formatINR(project.budget)}
          sub={
            <button type="button" className="link stat-card__edit" onClick={() => setEditingBudget(true)}>
              Edit budget
            </button>
          }
        />
        <MiniStat
          label="Actual cost"
          value={formatINR(cost.actual.grand)}
          sub={`${percent(cost.actual.grand, project.budget)}% of budget`}
        />
        <MiniStat
          label="Total payment received"
          value={formatINR(totalReceived)}
          sub={`${percent(totalReceived, project.budget)}% of budget`}
        />
        <MiniStat
          label="Current stage"
          value={<StatusBadge status={status} />}
          sub={`Manager: ${manager?.name || 'Unassigned'}`}
        />
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tabs__btn${tab === t ? ' tabs__btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab project={project} manager={manager} />}
      {/* {tab === 'Workers & Attendance' && <WorkersTab project={project} />} */}
      {tab === 'Expenses' && <CostsTab project={project} cost={cost} />}
      {tab === 'Payments Received' && <PaymentsTab project={project} total={totalReceived} />}
      {tab === 'Estimate Cost' && <EstimateTab project={project} />}

      {editingBudget && (
        <Modal title="Edit budget" onClose={() => setEditingBudget(false)}>
          <BudgetForm project={project} onDone={() => setEditingBudget(false)} />
        </Modal>
      )}
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

function OverviewTab({ project, manager }) {
  const { state } = useApp();
  const [editing, setEditing] = useState(false);
  return (
    <>
    <section className="card">
      <div className="card__header-row">
        <h2 className="card__title">Project details</h2>
        {!editing && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <ProjectDetailsForm project={project} onDone={() => setEditing(false)} />
      ) : (
      <dl className="detail-list">
        <div><dt>Description</dt><dd>{project.description || '\u2014'}</dd></div>
        <div><dt>Stage manager</dt><dd>{manager?.name || 'Unassigned'}</dd></div>
        <div><dt>Start date</dt><dd>{formatDMY(project.startDate)}</dd></div>
        <div><dt>State</dt><dd>{project.location.state}</dd></div>
        <div><dt>District</dt><dd>{project.location.district}</dd></div>
        <div><dt>Taluka</dt><dd>{project.location.taluka}</dd></div>
        <div><dt>Village</dt><dd>{project.location.village}</dd></div>
        <div><dt>Budget</dt><dd>{formatINR(project.budget)}</dd></div>
      </dl>
      )}
    </section>

    <section className="card">
      <div className="card__header-row">
        <h2 className="card__title">Stage managers</h2>
        <Link to={`/team?project=${project.id}`} className="link">Edit on Team page &rarr;</Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Stage</th>
              <th>Manager</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {state.statuses.map((s, i) => {
              const m = stageManagerOf(project, s.id, state.team);
              const isCurrent = s.id === project.statusId;
              return (
                <tr key={s.id} className={isCurrent ? 'table__row--current' : ''}>
                  <td className="table__index">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <StatusBadge status={s} />
                    {isCurrent && <span className="current-tag">Current</span>}
                  </td>
                  <td>{m ? m.name : <span className="muted">Unassigned</span>}</td>
                  <td>{m?.phone || '\u2014'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
    </>
  );
}

// Workers & Attendance tab - disabled for now.
// function WorkersTab({ project }) {
//   const { state, dispatch } = useApp();
//   const [selectedWorker, setSelectedWorker] = useState('');
//   const [assignDate, setAssignDate] = useState('2026-08-15');
//
//   const assignments = state.projectWorkers.filter((pw) => pw.projectId === project.id);
//   const assignedIds = new Set(assignments.map((a) => a.workerId));
//   const availableWorkers = state.workers.filter((w) => !assignedIds.has(w.id));
//
//   const recentAttendance = state.attendance
//     .filter((a) => a.projectId === project.id)
//     .sort((a, b) => (a.date < b.date ? 1 : -1))
//     .slice(0, 10);
//
//   function handleAssign(e) {
//     e.preventDefault();
//     if (!selectedWorker) return;
//     dispatch({
//       type: 'ASSIGN_WORKER',
//       payload: { projectId: project.id, workerId: selectedWorker, assignedDate: assignDate },
//     });
//     setSelectedWorker('');
//   }
//
//   return (
//     <>
//       <section className="card">
//         <h2 className="card__title">Assigned workers</h2>
//         {assignments.length === 0 ? (
//           <p className="muted">No workers assigned yet.</p>
//         ) : (
//           <div className="table-wrap">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Worker</th>
//                   <th>Role</th>
//                   <th>Daily rate</th>
//                   <th>Assigned since</th>
//                   <th />
//                 </tr>
//               </thead>
//               <tbody>
//                 {assignments.map((a) => {
//                   const worker = state.workers.find((w) => w.id === a.workerId);
//                   return (
//                     <tr key={a.id}>
//                       <td>{worker?.name}</td>
//                       <td>{worker?.role}</td>
//                       <td>{formatINR(worker?.dailyRate)}</td>
//                       <td>{a.assignedDate}</td>
//                       <td>
//                         <button
//                           className="btn btn--ghost btn--sm"
//                           onClick={() => dispatch({ type: 'REMOVE_ASSIGNMENT', payload: { id: a.id } })}
//                         >
//                           Remove
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//
//         {availableWorkers.length > 0 && (
//           <form className="inline-form" onSubmit={handleAssign}>
//             <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
//               <option value="">Select a worker to assign…</option>
//               {availableWorkers.map((w) => (
//                 <option key={w.id} value={w.id}>{w.name} — {w.role}</option>
//               ))}
//             </select>
//             <input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} />
//             <button type="submit" className="btn btn--primary btn--sm" disabled={!selectedWorker}>
//               Assign
//             </button>
//           </form>
//         )}
//       </section>
//
//       <section className="card">
//         <h2 className="card__title">Mark daily attendance</h2>
//         <AttendanceSheet project={project} />
//       </section>
//
//       <section className="card">
//         <h2 className="card__title">Recent attendance</h2>
//         {recentAttendance.length === 0 ? (
//           <p className="muted">No attendance recorded yet.</p>
//         ) : (
//           <div className="table-wrap">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Worker</th>
//                   <th>Present</th>
//                   <th>Hours</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentAttendance.map((a) => {
//                   const worker = state.workers.find((w) => w.id === a.workerId);
//                   return (
//                     <tr key={a.id}>
//                       <td>{a.date}</td>
//                       <td>{worker?.name}</td>
//                       <td>{a.present ? 'Yes' : 'No'}</td>
//                       <td>{a.hours}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </>
//   );
// }

// Local date as YYYY-MM-DD (toISOString would give the UTC date, which is wrong before 5:30 AM IST).
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Was this expense typed via "Other" rather than picked from the material list?
// New entries store the flag; older ones are checked against the list.
function isOtherItem(expense) {
  if (typeof expense.isOther === 'boolean') return expense.isOther;
  return !(ESTIMATE_CATALOG[normalizeCategory(expense.category)] || []).some((o) => o.name === expense.description);
}

function CostsTab({ project, cost }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    category: 'Material',
    description: '',
    amount: '',
    date: todayISO(),
  });
  // Newest first (state.expenses is already sorted by date).
  const entries = state.expenses.filter((e) => e.projectId === project.id);
  const entriesTotal = entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) return;
    const description = form.description.trim();
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        projectId: project.id,
        category: form.category,
        description,
        isOther: !(ESTIMATE_CATALOG[form.category] || []).some((o) => o.name === description),
        amount: Number(form.amount),
        date: form.date,
      },
    });
    setForm((f) => ({ ...f, description: '', amount: '' }));
  }

  const rows = COST_CATEGORIES.map((cat) => [cat, cost.estimated[cat], cost.actual[cat]]);

  return (
    <>
      <section className="card">
        <h2 className="card__title">Add cost</h2>
        <p className="muted">Log a material, labour or overhead expense for this project.</p>
        <form className="inline-form" onSubmit={handleSubmit}>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value,
                // A catalogue item from the old category doesn't fit the new one; keep custom text.
                description: (ESTIMATE_CATALOG[f.category] || []).some((o) => o.name === f.description)
                  ? ''
                  : f.description,
              }))
            }
          >
            {COST_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <SuggestInput
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            options={ESTIMATE_CATALOG[form.category] || []}
            placeholder={CATEGORY_HINTS[form.category]}
            ariaLabel="Expense description"
            allowOther
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <button type="submit" className="btn btn--primary btn--sm">Add expense</button>
        </form>
      </section>
      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">Cost entries</h2>
          <span className="muted">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        {entries.length === 0 ? (
          <p className="muted">No costs added yet. Use “Add cost” above to log the first one.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Material / item</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDMY(e.date)}</td>
                    <td>{normalizeCategory(e.category)}</td>
                    <td>
                      {isOtherItem(e) ? (
                        <>
                          <span className="tag-other">Other</span> {e.description}
                        </>
                      ) : (
                        e.description
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatINR(e.amount)}</td>
                  </tr>
                ))}
                <tr className="table__row--total">
                  <td colSpan={3}>Total</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatINR(entriesTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Actual vs. estimated cost</h2>
        {!cost.estimate && <p className="muted">No estimate has been created for this project yet.</p>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Estimated</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, est, act]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{formatINR(est)}</td>
                  <td>{formatINR(act)}</td>
                  <td className={act > est ? 'text-danger' : 'text-success'}>
                    {act > est ? '+' : ''}{formatINR(act - est)}
                  </td>
                </tr>
              ))}
              <tr className="table__row--total">
                <td>Total</td>
                <td>{formatINR(cost.estimated.grand)}</td>
                <td>{formatINR(cost.actual.grand)}</td>
                <td className={cost.actual.grand > cost.estimated.grand ? 'text-danger' : 'text-success'}>
                  {cost.actual.grand > cost.estimated.grand ? '+' : ''}
                  {formatINR(cost.actual.grand - cost.estimated.grand)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}

const PAYMENT_MODES = ['Bank transfer', 'UPI', 'Cheque', 'Cash'];

function PaymentsTab({ project, total }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ amount: '', date: todayISO(), mode: PAYMENT_MODES[0], note: '' });
  // Newest first (state.payments is already sorted by date).
  const entries = state.payments.filter((p) => p.projectId === project.id);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        projectId: project.id,
        amount: Number(form.amount),
        date: form.date,
        mode: form.mode,
        note: form.note.trim(),
      },
    });
    setForm((f) => ({ ...f, amount: '', note: '' }));
  }

  return (
    <>
      <section className="card">
        <h2 className="card__title">Record payment</h2>
        <p className="muted">Log money received from the client for this project.</p>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Note (optional, e.g. cheque no. or instalment)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
          <button type="submit" className="btn btn--primary btn--sm">Add payment</button>
        </form>
      </section>
      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">Payments received</h2>
          <span className="muted">{entries.length} {entries.length === 1 ? 'payment' : 'payments'}</span>
        </div>
        {entries.length === 0 ? (
          <p className="muted">No payments recorded yet. Use “Record payment” above to log the first one.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Note</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((p) => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDMY(p.date)}</td>
                    <td>{p.mode || '—'}</td>
                    <td>{p.note || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatINR(p.amount)}</td>
                  </tr>
                ))}
                <tr className="table__row--total">
                  <td colSpan={3}>Total received</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatINR(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function EstimateTab({ project }) {
  const { state } = useApp();
  const [showBuilder, setShowBuilder] = useState(false);
  const [baseEstimate, setBaseEstimate] = useState(null); // set when editing a version
  const openBuilder = (est = null) => {
    setBaseEstimate(est);
    setShowBuilder(true);
  };
  const versions = state.estimates
    .filter((e) => e.projectId === project.id)
    .sort((a, b) => b.version - a.version);

  return (
    <section className="card">
      <div className="card__header-row">
        <h2 className="card__title">Estimate versions</h2>
        <button className="btn btn--primary btn--sm" onClick={() => openBuilder()}>
          + New version
        </button>
      </div>

      {versions.length === 0 ? (
        <p className="muted">No estimate created yet.</p>
      ) : (
        versions.map((est) => {
          const items = costItems(est);
          const total = items.reduce((s, it) => s + estimateItemTotal(it), 0);
          return (
            <details key={est.id} className="estimate-version" open={est === versions[0]}>
              <summary>
                Version {est.version} — {formatDMY(est.createdDate)} — <strong>{formatINR(total)}</strong>
                {est.basedOnVersion && <span className="muted"> (edited from v{est.basedOnVersion})</span>}
              </summary>
              <EstimateActions project={project} estimate={est} onEdit={openBuilder} />
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.category}</td>
                        <td>{it.description}</td>
                        <td>{it.quantity}{it.unit && <span className="table__unit"> {it.unit}</span>}</td>
                        <td>{formatINR(it.unitRate)}</td>
                        <td>{formatINR(estimateItemTotal(it))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })
      )}

      {showBuilder && (
        <Modal
          title={baseEstimate ? `Edit estimate v${baseEstimate.version} \u2014 ${project.name}` : `New estimate \u2014 ${project.name}`}
          onClose={() => setShowBuilder(false)}
          wide
        >
          <EstimateBuilder project={project} baseEstimate={baseEstimate} onDone={() => setShowBuilder(false)} />
        </Modal>
      )}
    </section>
  );
}
