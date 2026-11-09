import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import StatusBadge from '../components/StatusBadge';

export default function Team() {
  const { state, dispatch } = useApp();
  const { team, projects, statuses } = state;
  const [showForm, setShowForm] = useState(false);

  // ?project=<id> preselects a project (used by the "Edit" link on the project page).
  const [searchParams, setSearchParams] = useSearchParams();
  const project = projects.find((p) => p.id === searchParams.get('project')) || projects[0];

  // How many stages each member manages, and on how many projects, across the portfolio.
  const workload = useMemo(() => {
    const out = {};
    projects.forEach((p) => {
      Object.values(p.stageManagers || {}).forEach((memberId) => {
        out[memberId] ??= { stages: 0, projects: new Set() };
        out[memberId].stages += 1;
        out[memberId].projects.add(p.id);
      });
    });
    return out;
  }, [projects]);

  function removeMember(member) {
    const stages = workload[member.id]?.stages || 0;
    const msg = stages
      ? `Remove ${member.name}? They manage ${stages} stage(s); those will become unassigned.`
      : `Remove ${member.name}?`;
    if (window.confirm(msg)) dispatch({ type: 'REMOVE_MEMBER', payload: { id: member.id } });
  }

  function assign(statusId, memberId) {
    dispatch({ type: 'ASSIGN_STAGE_MANAGER', payload: { projectId: project.id, statusId, memberId } });
  }

  const unassigned = project ? statuses.filter((s) => !project.stageManagers?.[s.id]).length : 0;

  return (
    <div className="page">
      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">Team members</h2>
          <button className="btn btn--primary btn--sm" onClick={() => setShowForm(true)}>+ Add member</button>
        </div>
        {team.length === 0 ? (
          <p className="muted">No team members yet. Add your stage managers to start assigning stages.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Stages managed</th>
                  <th>Projects</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {team.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="member">
                        <span className="member__avatar" aria-hidden="true">{initials(m.name)}</span>
                        <strong>{m.name}</strong>
                      </span>
                    </td>
                    <td>{m.role}</td>
                    <td>{m.phone || '—'}</td>
                    <td>{workload[m.id]?.stages || 0}</td>
                    <td>{workload[m.id]?.projects.size || 0}</td>
                    <td className="table__actions">
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => removeMember(m)}
                        aria-label={`Remove ${m.name}`}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {project && (
        <section className="card">
          <div className="card__header-row">
            <h2 className="card__title">Stage managers</h2>
            <label className="field field--inline">
              <span>Project</span>
              <select value={project.id} onChange={(e) => setSearchParams({ project: e.target.value })}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="muted">
            Pick who manages each stage of <strong>{project.name}</strong>. Each project can have different
            managers. {unassigned > 0 ? `${unassigned} of ${statuses.length} stages are unassigned.` : 'All stages are assigned.'}
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stage</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((s, i) => {
                  const isCurrent = s.id === project.statusId;
                  return (
                    <tr key={s.id} className={isCurrent ? 'table__row--current' : ''}>
                      <td className="table__index">{String(i + 1).padStart(2, '0')}</td>
                      <td>
                        <StatusBadge status={s} />
                        {isCurrent && <span className="current-tag">Current</span>}
                      </td>
                      <td>
                        <select
                          value={project.stageManagers?.[s.id] || ''}
                          onChange={(e) => assign(s.id, e.target.value)}
                          aria-label={`Manager for ${s.name}`}
                        >
                          <option value="">Unassigned</option>
                          {team.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showForm && (
        <Modal title="Add team member" onClose={() => setShowForm(false)}>
          <MemberForm onDone={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}
