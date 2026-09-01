import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import StatusManager from '../components/StatusManager';
import StatusBadge from '../components/StatusBadge';
import { projectCostSummary, formatINR, percent } from '../utils/costs';
import { LOCATIONS } from '../data/seedData';

export default function Projects() {
  const { state } = useApp();
  const { projects, statuses, workers, attendance, estimates, expenses } = state;

  const [showNewProject, setShowNewProject] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [districtFilter, setDistrictFilter] = useState('All');
  const [talukaFilter, setTalukaFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const districts = useMemo(() => {
    const set = new Set(projects.map((p) => p.location.district));
    return ['All', ...set];
  }, [projects]);

  const talukas = useMemo(() => {
    if (districtFilter === 'All') {
      const set = new Set(projects.map((p) => p.location.taluka));
      return ['All', ...set];
    }
    return ['All', ...(LOCATIONS.Maharashtra[districtFilter] || [])];
  }, [projects, districtFilter]);

  const filtered = projects.filter((p) => {
    if (districtFilter !== 'All' && p.location.district !== districtFilter) return false;
    if (talukaFilter !== 'All' && p.location.taluka !== talukaFilter) return false;
    if (statusFilter !== 'All' && p.statusId !== statusFilter) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page__toolbar">
        <div className="filter-bar">
          <label className="field field--inline">
            <span>District</span>
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setTalukaFilter('All');
              }}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="field field--inline">
            <span>Taluka</span>
            <select value={talukaFilter} onChange={(e) => setTalukaFilter(e.target.value)}>
              {talukas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field field--inline">
            <span>Stage</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="page__toolbar-actions">
          <button className="btn btn--ghost" onClick={() => setShowStatusManager(true)}>
            Manage stages
          </button>
          <button className="btn btn--primary" onClick={() => setShowNewProject(true)}>
            + New project
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No projects match these filters.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((project) => {
            const status = statuses.find((s) => s.id === project.statusId);
            const cost = projectCostSummary(project, { attendance, workers, estimates, expenses });
            const pct = percent(cost.actual.grand, project.budget);
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                <div className="project-card__header">
                  <h3>{project.name}</h3>
                  <StatusBadge status={status} />
                </div>
                <p className="project-card__location">
                  {project.location.village}, {project.location.taluka}, {project.location.district}
                </p>
                {project.description && <p className="project-card__desc">{project.description}</p>}
                <div className="project-card__meta">
                  <span>Manager: {project.manager}</span>
                  <span>Started {project.startDate}</span>
                </div>
                <div className="project-card__cost">
                  <div className="progress-track">
                    <div
                      className={`progress-fill${pct >= 100 ? ' progress-fill--over' : ''}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="project-card__cost-labels">
                    <span>{formatINR(cost.actual.grand)} spent</span>
                    <span>{formatINR(project.budget)} budget</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showNewProject && (
        <Modal title="Create new project" onClose={() => setShowNewProject(false)}>
          <ProjectForm onDone={() => setShowNewProject(false)} />
        </Modal>
      )}
      {showStatusManager && (
        <Modal title="Manage stages" onClose={() => setShowStatusManager(false)}>
          <StatusManager />
        </Modal>
      )}
    </div>
  );
}
