// Pure calculation helpers shared across pages. Kept framework-free so they're easy to unit test.

export function estimateItemTotal(item) {
  return Number(item.quantity || 0) * Number(item.unitRate || 0);
}

export function estimateTotals(estimate) {
  const totals = { Material: 0, Labor: 0, Overhead: 0 };
  (estimate?.items || []).forEach((item) => {
    totals[item.category] = (totals[item.category] || 0) + estimateItemTotal(item);
  });
  totals.grand = totals.Material + totals.Labor + totals.Overhead;
  return totals;
}

export function latestEstimate(estimates, projectId) {
  const forProject = estimates.filter((e) => e.projectId === projectId);
  if (forProject.length === 0) return null;
  return forProject.reduce((a, b) => (b.version > a.version ? b : a));
}

export function actualLaborCost(attendance, workers, projectId) {
  const workerRate = Object.fromEntries(workers.map((w) => [w.id, w.dailyRate]));
  return attendance
    .filter((a) => a.projectId === projectId && a.present)
    .reduce((sum, a) => sum + (Number(a.hours) / 8) * (workerRate[a.workerId] || 0), 0);
}

export function actualExpenseTotals(expenses, projectId) {
  const totals = { Material: 0, Overhead: 0 };
  expenses
    .filter((e) => e.projectId === projectId)
    .forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
    });
  return totals;
}

export function projectCostSummary(project, { attendance, workers, estimates, expenses }) {
  const est = latestEstimate(estimates, project.id);
  const estTotals = est ? estimateTotals(est) : { Material: 0, Labor: 0, Overhead: 0, grand: 0 };
  const actualLabor = actualLaborCost(attendance, workers, project.id);
  const actualExp = actualExpenseTotals(expenses, project.id);
  const actualTotal = actualLabor + actualExp.Material + actualExp.Overhead;
  return {
    estimate: est,
    estimated: estTotals,
    actual: {
      Material: actualExp.Material,
      Labor: actualLabor,
      Overhead: actualExp.Overhead,
      grand: actualTotal,
    },
  };
}

export function dailyLaborCostSeries(attendance, workers, projectId) {
  const workerRate = Object.fromEntries(workers.map((w) => [w.id, w.dailyRate]));
  const byDate = {};
  attendance
    .filter((a) => a.projectId === projectId && a.present)
    .forEach((a) => {
      const cost = (Number(a.hours) / 8) * (workerRate[a.workerId] || 0);
      byDate[a.date] = (byDate[a.date] || 0) + cost;
    });
  return Object.entries(byDate)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, cost]) => ({ date, cost: Math.round(cost) }));
}

export function formatINR(amount) {
  const n = Math.round(Number(amount || 0));
  return '\u20B9' + n.toLocaleString('en-IN');
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
