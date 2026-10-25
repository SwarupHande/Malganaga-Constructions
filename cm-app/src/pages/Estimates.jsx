import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EstimateBuilder from '../components/EstimateBuilder';
import {
  projectCostSummary,
  latestEstimate,
  estimateTotals,
  estimateItemTotal,
  formatINR,
  percent,
} from '../utils/costs';
import { CHART_COLORS, PIE_COLORS, AXIS_TICK, TOOLTIP_STYLE, BAR_RADIUS } from '../utils/chartTheme';

export default function Estimates() {
  const { state } = useApp();
  const { projects, statuses, workers, attendance, estimates, expenses } = state;

  const [showBuilder, setShowBuilder] = useState(false);
  const [builderProjectId, setBuilderProjectId] = useState(projects[0]?.id || '');

  const rows = useMemo(
    () =>
      projects.map((p) => {
        const cost = projectCostSummary(p, { attendance, workers, estimates, expenses });
        const est = latestEstimate(estimates, p.id);
        const stage = statuses.find((s) => s.id === p.statusId);
        return { project: p, cost, estimate: est, stage };
      }),
    [projects, statuses, attendance, workers, estimates, expenses]
  );

  const withEstimate = rows.filter((r) => r.estimate);
  const withoutEstimate = rows.filter((r) => !r.estimate);
  const totalEstimated = withEstimate.reduce((s, r) => s + r.cost.estimated.grand, 0);
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const avgEstimateRatio =
    withEstimate.length > 0
      ? Math.round(
          withEstimate.reduce((s, r) => s + percent(r.cost.estimated.grand, r.project.budget), 0) /
            withEstimate.length
        )
      : 0;

  const portfolioBreakdown = ['Material', 'Labor', 'Overhead'].map((cat) => ({
    name: cat,
    value: Math.round(withEstimate.reduce((s, r) => s + r.cost.estimated[cat], 0)),
  })).filter((d) => d.value > 0);

  const estimateVsBudget = rows.map((r) => ({
    name: shortName(r.project.name),
    Budget: r.project.budget,
    Estimate: Math.round(r.cost.estimated.grand),
  }));

  function openBuilder(projectId) {
    setBuilderProjectId(projectId);
    setShowBuilder(true);
  }

  const builderProject = projects.find((p) => p.id === builderProjectId);

  return (
    <div className="page">
      <div className="stat-grid">
        <StatCard label="Total estimated" value={formatINR(totalEstimated)} />
        <StatCard label="Projects with estimate" value={withEstimate.length} sub={`of ${projects.length} total`} />
        <StatCard
          label="Missing estimates"
          value={withoutEstimate.length}
          tone={withoutEstimate.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Avg estimate vs budget"
          value={withEstimate.length ? `${avgEstimateRatio}%` : '\u2014'}
          sub={withEstimate.length ? 'latest version per project' : 'No estimates yet'}
        />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2 className="card__title">Estimate vs. budget — all projects</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={estimateVsBudget} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCompact(v)} tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.grid }} />
                <Legend />
                <Bar dataKey="Budget" fill={CHART_COLORS.muted} radius={BAR_RADIUS} />
                <Bar dataKey="Estimate" fill={CHART_COLORS.primary} radius={BAR_RADIUS} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Portfolio estimate breakdown</h2>
          {portfolioBreakdown.length === 0 ? (
            <p className="muted">No estimates created yet.</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={portfolioBreakdown} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55} paddingAngle={2} stroke="none" label>
                    {portfolioBreakdown.map((d) => (
                      <Cell key={d.name} fill={PIE_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.grid }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {withoutEstimate.length > 0 && (
        <section className="card">
          <h2 className="card__title">Projects needing an estimate</h2>
          <ul className="attention-list">
            {withoutEstimate.map(({ project, stage }) => (
              <li key={project.id} className="attention-list__item">
                <div>
                  <Link to={`/projects/${project.id}`} className="attention-list__name">
                    {project.name}
                  </Link>
                  <span className="muted" style={{ marginLeft: 8 }}>
                    {stage?.name}
                  </span>
                </div>
                <button className="btn btn--primary btn--sm" onClick={() => openBuilder(project.id)}>
                  Create estimate
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">All project estimates</h2>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => openBuilder(projects[0]?.id)}
            disabled={projects.length === 0}
          >
            + New estimate
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Stage</th>
                <th>Budget</th>
                <th>Latest estimate</th>
                <th>Variance</th>
                <th>Versions</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ project, cost, stage, estimate }) => {
                const versionCount = estimates.filter((e) => e.projectId === project.id).length;
                const variance = cost.estimated.grand - project.budget;
                return (
                  <tr key={project.id}>
                    <td>
                      <Link to={`/projects/${project.id}`} className="link">{project.name}</Link>
                    </td>
                    <td><StatusBadge status={stage} /></td>
                    <td>{formatINR(project.budget)}</td>
                    <td>{estimate ? formatINR(cost.estimated.grand) : '\u2014'}</td>
                    <td className={estimate && variance > 0 ? 'text-danger' : estimate ? 'text-success' : ''}>
                      {estimate
                        ? `${variance > 0 ? '+' : ''}${formatINR(variance)}`
                        : '\u2014'}
                    </td>
                    <td>{versionCount || '\u2014'}</td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => openBuilder(project.id)}>
                        {estimate ? 'New version' : 'Create'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {withEstimate.length > 0 && (
        <section className="card">
          <h2 className="card__title">Latest estimate details</h2>
          {withEstimate.map(({ project, estimate, stage }) => {
            const totals = estimateTotals(estimate);
            return (
              <details key={project.id} className="estimate-version">
                <summary>
                  {project.name} — {stage?.name} — v{estimate.version} —{' '}
                  <strong>{formatINR(totals.grand)}</strong>
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
                      {estimate.items.map((it) => (
                        <tr key={it.id}>
                          <td>{it.category}</td>
                          <td>{it.description}</td>
                          <td>{it.quantity}</td>
                          <td>{formatINR(it.unitRate)}</td>
                          <td>{formatINR(estimateItemTotal(it))}</td>
                        </tr>
                      ))}
                      <tr className="table__row--total">
                        <td colSpan={4}>Grand total</td>
                        <td>{formatINR(totals.grand)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </section>
      )}

      {showBuilder && builderProject && (
        <Modal title={`New estimate \u2014 ${builderProject.name}`} onClose={() => setShowBuilder(false)} wide>
          <label className="field" style={{ marginBottom: 16 }}>
            <span>Project</span>
            <select
              value={builderProjectId}
              onChange={(e) => setBuilderProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <EstimateBuilder
            project={projects.find((p) => p.id === builderProjectId) || builderProject}
            onDone={() => setShowBuilder(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function shortName(name) {
  return name.length > 14 ? name.slice(0, 13) + '\u2026' : name;
}

function formatCompact(v) {
  if (v >= 100000) return `\u20B9${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `\u20B9${(v / 1000).toFixed(0)}k`;
  return `\u20B9${v}`;
}
