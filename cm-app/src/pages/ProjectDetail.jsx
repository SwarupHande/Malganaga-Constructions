import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AttendanceSheet from '../components/AttendanceSheet';
import EstimateBuilder from '../components/EstimateBuilder';
import {
  projectCostSummary,
  estimateItemTotal,
  formatINR,
  percent,
} from '../utils/costs';

const TABS = ['Overview', 'Workers & Attendance', 'Costs', 'Estimate'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState(TABS[0]);

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
  const cost = projectCostSummary(project, {
    attendance: state.attendance,
    workers: state.workers,
    estimates: state.estimates,
    expenses: state.expenses,
  });
  const daysElapsed = Math.max(
    0,
    Math.round((new Date('2026-08-15') - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
  );

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
        <MiniStat label="Budget" value={formatINR(project.budget)} />
        <MiniStat
          label="Actual cost"
          value={formatINR(cost.actual.grand)}
          sub={`${percent(cost.actual.grand, project.budget)}% of budget`}
        />
        <MiniStat label="Days elapsed" value={daysElapsed} />
        <MiniStat label="Current stage" value={<StatusBadge status={status} />} />
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

      {tab === 'Overview' && <OverviewTab project={project} />}
      {tab === 'Workers & Attendance' && <WorkersTab project={project} />}
      {tab === 'Costs' && <CostsTab project={project} cost={cost} />}
      {tab === 'Estimate' && <EstimateTab project={project} />}
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

function OverviewTab({ project }) {
  return (
    <section className="card">
      <h2 className="card__title">Project details</h2>
      <dl className="detail-list">
        <div><dt>Description</dt><dd>{project.description || '\u2014'}</dd></div>
        <div><dt>Site manager</dt><dd>{project.manager}</dd></div>
        <div><dt>Start date</dt><dd>{project.startDate}</dd></div>
        <div><dt>State</dt><dd>{project.location.state}</dd></div>
        <div><dt>District</dt><dd>{project.location.district}</dd></div>
        <div><dt>Taluka</dt><dd>{project.location.taluka}</dd></div>
        <div><dt>Village</dt><dd>{project.location.village}</dd></div>
        <div><dt>Budget</dt><dd>{formatINR(project.budget)}</dd></div>
      </dl>
    </section>
  );
}

function WorkersTab({ project }) {
  const { state, dispatch } = useApp();
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assignDate, setAssignDate] = useState('2026-08-15');

  const assignments = state.projectWorkers.filter((pw) => pw.projectId === project.id);
  const assignedIds = new Set(assignments.map((a) => a.workerId));
  const availableWorkers = state.workers.filter((w) => !assignedIds.has(w.id));

  const recentAttendance = state.attendance
    .filter((a) => a.projectId === project.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  function handleAssign(e) {
    e.preventDefault();
    if (!selectedWorker) return;
    dispatch({
      type: 'ASSIGN_WORKER',
      payload: { projectId: project.id, workerId: selectedWorker, assignedDate: assignDate },
    });
    setSelectedWorker('');
  }

  return (
    <>
      <section className="card">
        <h2 className="card__title">Assigned workers</h2>
        {assignments.length === 0 ? (
          <p className="muted">No workers assigned yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Role</th>
                  <th>Daily rate</th>
                  <th>Assigned since</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const worker = state.workers.find((w) => w.id === a.workerId);
                  return (
                    <tr key={a.id}>
                      <td>{worker?.name}</td>
                      <td>{worker?.role}</td>
                      <td>{formatINR(worker?.dailyRate)}</td>
                      <td>{a.assignedDate}</td>
                      <td>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => dispatch({ type: 'REMOVE_ASSIGNMENT', payload: { id: a.id } })}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {availableWorkers.length > 0 && (
          <form className="inline-form" onSubmit={handleAssign}>
            <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
              <option value="">Select a worker to assign…</option>
              {availableWorkers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {w.role}</option>
              ))}
            </select>
            <input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} />
            <button type="submit" className="btn btn--primary btn--sm" disabled={!selectedWorker}>
              Assign
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Mark daily attendance</h2>
        <AttendanceSheet project={project} />
      </section>

      <section className="card">
        <h2 className="card__title">Recent attendance</h2>
        {recentAttendance.length === 0 ? (
          <p className="muted">No attendance recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Present</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((a) => {
                  const worker = state.workers.find((w) => w.id === a.workerId);
                  return (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{worker?.name}</td>
                      <td>{a.present ? 'Yes' : 'No'}</td>
                      <td>{a.hours}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function CostsTab({ project, cost }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    category: 'Material',
    description: '',
    amount: '',
    date: '2026-08-15',
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) return;
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        projectId: project.id,
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        date: form.date,
      },
    });
    setForm((f) => ({ ...f, description: '', amount: '' }));
  }

  const rows = [
    ['Material', cost.estimated.Material, cost.actual.Material],
    ['Labor', cost.estimated.Labor, cost.actual.Labor],
    ['Overhead', cost.estimated.Overhead, cost.actual.Overhead],
  ];

  return (
    <>
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

      <section className="card">
        <h2 className="card__title">Log a material or overhead expense</h2>
        <p className="muted">Labor cost is calculated automatically from attendance records.</p>
        <form className="inline-form" onSubmit={handleSubmit}>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="Material">Material</option>
            <option value="Overhead">Overhead</option>
          </select>
          <input
            type="text"
            placeholder="e.g. Cement delivery"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
    </>
  );
}

function EstimateTab({ project }) {
  const { state } = useApp();
  const [showBuilder, setShowBuilder] = useState(false);
  const versions = state.estimates
    .filter((e) => e.projectId === project.id)
    .sort((a, b) => b.version - a.version);

  return (
    <section className="card">
      <div className="card__header-row">
        <h2 className="card__title">Estimate versions</h2>
        <button className="btn btn--primary btn--sm" onClick={() => setShowBuilder(true)}>
          + New version
        </button>
      </div>

      {versions.length === 0 ? (
        <p className="muted">No estimate created yet.</p>
      ) : (
        versions.map((est) => {
          const total = est.items.reduce((s, it) => s + estimateItemTotal(it), 0);
          return (
            <details key={est.id} className="estimate-version" open={est === versions[0]}>
              <summary>
                Version {est.version} — {est.createdDate} — <strong>{formatINR(total)}</strong>
              </summary>
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
                    {est.items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.category}</td>
                        <td>{it.description}</td>
                        <td>{it.quantity}</td>
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
        <Modal title={`New estimate \u2014 ${project.name}`} onClose={() => setShowBuilder(false)} wide>
          <EstimateBuilder project={project} onDone={() => setShowBuilder(false)} />
        </Modal>
      )}
    </section>
  );
}
