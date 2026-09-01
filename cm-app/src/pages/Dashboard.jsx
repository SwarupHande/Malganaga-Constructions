import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { projectCostSummary, formatINR, percent } from '../utils/costs';

export default function Dashboard() {
  const { state } = useApp();
  const { projects, statuses, workers, attendance, estimates, expenses } = state;

  const summaries = projects.map((p) => ({
    project: p,
    cost: projectCostSummary(p, { attendance, workers, estimates, expenses }),
  }));

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalActual = summaries.reduce((s, x) => s + x.cost.actual.grand, 0);

  const stageCounts = statuses
    .map((s) => ({
      status: s,
      count: projects.filter((p) => p.statusId === s.id).length,
    }))
    .filter((s) => s.count > 0);
  const maxCount = Math.max(1, ...stageCounts.map((s) => s.count));

  const attention = summaries
    .filter((x) => percent(x.cost.actual.grand, x.project.budget) >= 70)
    .sort((a, b) => percent(b.cost.actual.grand, b.project.budget) - percent(a.cost.actual.grand, a.project.budget));

  return (
    <div className="page">
      <div className="stat-grid">
        <StatCard label="Active projects" value={projects.length} />
        <StatCard label="Total budget" value={formatINR(totalBudget)} />
        <StatCard
          label="Total actual cost"
          value={formatINR(totalActual)}
          sub={`${percent(totalActual, totalBudget)}% of budget`}
          tone={percent(totalActual, totalBudget) >= 90 ? 'warning' : 'default'}
        />
        <StatCard label="Workers on roll" value={workers.length} />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2 className="card__title">Projects by stage</h2>
          {stageCounts.length === 0 ? (
            <p className="muted">No projects assigned to a stage yet.</p>
          ) : (
          <div className="status-chart status-chart--scroll">
            {stageCounts.map(({ status, count }) => (
              <div key={status.id} className="status-chart__row">
                <span className="status-chart__label">{status.name}</span>
                <div className="status-chart__track">
                  <div
                    className={`status-chart__bar status-chart__bar--${status.color}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="status-chart__count">{count}</span>
              </div>
            ))}
          </div>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">Needs attention</h2>
          {attention.length === 0 ? (
            <p className="muted">No projects are close to their budget limit right now.</p>
          ) : (
            <ul className="attention-list">
              {attention.map(({ project, cost }) => {
                const pct = percent(cost.actual.grand, project.budget);
                return (
                  <li key={project.id} className="attention-list__item">
                    <Link to={`/projects/${project.id}`} className="attention-list__name">
                      {project.name}
                    </Link>
                    <span className={`attention-list__pct${pct >= 100 ? ' attention-list__pct--over' : ''}`}>
                      {pct}% of budget spent
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">Recent projects</h2>
          <Link to="/projects" className="link">View all &rarr;</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Location</th>
                <th>Stage</th>
                <th>Budget</th>
                <th>Actual cost</th>
              </tr>
            </thead>
            <tbody>
              {summaries.slice(0, 5).map(({ project, cost }) => {
                const status = statuses.find((s) => s.id === project.statusId);
                return (
                  <tr key={project.id}>
                    <td>
                      <Link to={`/projects/${project.id}`} className="link">{project.name}</Link>
                    </td>
                    <td>{project.location.taluka}, {project.location.district}</td>
                    <td><StatusBadge status={status} /></td>
                    <td>{formatINR(project.budget)}</td>
                    <td>{formatINR(cost.actual.grand)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
