import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import WorkerForm from '../components/WorkerForm';
import { formatINR } from '../utils/costs';

export default function Workers() {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');

  const roles = useMemo(() => ['All', ...new Set(state.workers.map((w) => w.role))], [state.workers]);

  const projectCountByWorker = useMemo(() => {
    const counts = {};
    state.projectWorkers.forEach((pw) => {
      counts[pw.workerId] = (counts[pw.workerId] || 0) + 1;
    });
    return counts;
  }, [state.projectWorkers]);

  const filtered = state.workers.filter((w) => roleFilter === 'All' || w.role === roleFilter);

  return (
    <div className="page">
      <div className="page__toolbar">
        <div className="filter-bar">
          <label className="field field--inline">
            <span>Role</span>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="page__toolbar-actions">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>+ Add worker</button>
        </div>
      </div>

      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Daily rate</th>
                <th>Active projects</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.role}</td>
                  <td>{formatINR(w.dailyRate)}</td>
                  <td>{projectCountByWorker[w.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <Modal title="Add worker" onClose={() => setShowForm(false)}>
          <WorkerForm onDone={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
