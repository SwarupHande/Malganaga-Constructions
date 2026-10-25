import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { projectCostSummary, dailyLaborCostSeries, formatINR } from '../utils/costs';
import { CHART_COLORS, PIE_COLORS, AXIS_TICK, TOOLTIP_STYLE, BAR_RADIUS } from '../utils/chartTheme';

export default function Reports() {
  const { state } = useApp();
  const { projects, workers, attendance, estimates, expenses } = state;

  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const project = projects.find((p) => p.id === projectId) || projects[0];

  const portfolioData = projects.map((p) => {
    const cost = projectCostSummary(p, { attendance, workers, estimates, expenses });
    return { name: shortName(p.name), Budget: p.budget, Actual: Math.round(cost.actual.grand) };
  });

  const cost = project
    ? projectCostSummary(project, { attendance, workers, estimates, expenses })
    : null;

  const costVsEstimateData = cost
    ? [
        { name: 'Material', Estimated: Math.round(cost.estimated.Material), Actual: Math.round(cost.actual.Material) },
        { name: 'Labor', Estimated: Math.round(cost.estimated.Labor), Actual: Math.round(cost.actual.Labor) },
        { name: 'Overhead', Estimated: Math.round(cost.estimated.Overhead), Actual: Math.round(cost.actual.Overhead) },
        { name: 'Total', Estimated: Math.round(cost.estimated.grand), Actual: Math.round(cost.actual.grand) },
      ]
    : [];

  const laborSeries = project ? dailyLaborCostSeries(attendance, workers, project.id) : [];

  const pieData = cost && cost.estimate
    ? ['Material', 'Labor', 'Overhead']
        .map((cat) => ({ name: cat, value: Math.round(cost.estimated[cat]) }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="page">
      <section className="card">
        <h2 className="card__title">Budget vs. actual cost — all projects</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={portfolioData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCompact(v)} tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.grid }} />
              <Legend />
              <Bar dataKey="Budget" fill={CHART_COLORS.muted} radius={BAR_RADIUS} />
              <Bar dataKey="Actual" fill={CHART_COLORS.accent} radius={BAR_RADIUS} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="page__toolbar">
        <label className="field field--inline">
          <span>Project</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      {project && (
        <div className="dashboard-grid">
          <section className="card">
            <h2 className="card__title">Cost vs. estimate — {project.name}</h2>
            {costVsEstimateData.every((d) => d.Estimated === 0) && (
              <p className="muted">No estimate created yet for this project.</p>
            )}
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={costVsEstimateData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCompact(v)} tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.grid }} />
                  <Legend />
                  <Bar dataKey="Estimated" fill={CHART_COLORS.muted} radius={BAR_RADIUS} />
                  <Bar dataKey="Actual" fill={CHART_COLORS.accent} radius={BAR_RADIUS} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">Estimate breakdown</h2>
            {pieData.length === 0 ? (
              <p className="muted">No estimate created yet for this project.</p>
            ) : (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={55} paddingAngle={2} stroke="none" label>
                      {pieData.map((d) => (
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
      )}

      {project && (
        <section className="card">
          <h2 className="card__title">Daily labor cost — {project.name}</h2>
          {laborSeries.length === 0 ? (
            <p className="muted">No attendance recorded yet for this project.</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={laborSeries} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCompact(v)} tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={TOOLTIP_STYLE} cursor={{ fill: CHART_COLORS.grid }} />
                  <Line type="monotone" dataKey="cost" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
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
