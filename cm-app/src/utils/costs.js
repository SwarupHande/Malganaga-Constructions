// Pure calculation helpers shared across pages. Kept framework-free so they're easy to unit test.

// Worker features are disabled for now, so Labor is left out of every estimate and cost total.
// To bring it back, add 'Labor' here and uncomment the labor code below.
export const COST_CATEGORIES = ['Material', 'Overhead'];
export const LABOR_EXCLUDED_NOTE =
  'Worker (labor) expenses are excluded from these figures, so the actual project cost may vary.';

// Estimate line items that count toward totals (drops Labor items from older estimates).
export function costItems(estimate) {
  return (estimate?.items || []).filter((item) => COST_CATEGORIES.includes(item.category));
}

export function estimateItemTotal(item) {
  return Number(item.quantity || 0) * Number(item.unitRate || 0);
}

export function estimateTotals(estimate) {
  const totals = { Material: 0, Overhead: 0 };
  costItems(estimate).forEach((item) => {
    totals[item.category] += estimateItemTotal(item);
  });
  totals.grand = totals.Material + totals.Overhead;
  return totals;
}

export function latestEstimate(estimates, projectId) {
  const forProject = estimates.filter((e) => e.projectId === projectId);
  if (forProject.length === 0) return null;
  return forProject.reduce((a, b) => (b.version > a.version ? b : a));
}

// Labor cost from attendance - disabled along with the worker features.
// export function actualLaborCost(attendance, workers, projectId) {
//   const workerRate = Object.fromEntries(workers.map((w) => [w.id, w.dailyRate]));
//   return attendance
//     .filter((a) => a.projectId === projectId && a.present)
//     .reduce((sum, a) => sum + (Number(a.hours) / 8) * (workerRate[a.workerId] || 0), 0);
// }

export function actualExpenseTotals(expenses, projectId) {
  const totals = { Material: 0, Overhead: 0 };
  expenses
    .filter((e) => e.projectId === projectId && COST_CATEGORIES.includes(e.category))
    .forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
    });
  return totals;
}

export function projectCostSummary(project, { estimates, expenses }) {
  const est = latestEstimate(estimates, project.id);
  const estTotals = est ? estimateTotals(est) : { Material: 0, Overhead: 0, grand: 0 };
  // const actualLabor = actualLaborCost(attendance, workers, project.id);
  const actualExp = actualExpenseTotals(expenses, project.id);
  const actualTotal = actualExp.Material + actualExp.Overhead;
  return {
    estimate: est,
    estimated: estTotals,
    actual: {
      Material: actualExp.Material,
      // Labor: actualLabor,
      Overhead: actualExp.Overhead,
      grand: actualTotal,
    },
  };
}

// Daily labor cost chart data - disabled along with the worker features.
// export function dailyLaborCostSeries(attendance, workers, projectId) {
//   const workerRate = Object.fromEntries(workers.map((w) => [w.id, w.dailyRate]));
//   const byDate = {};
//   attendance
//     .filter((a) => a.projectId === projectId && a.present)
//     .forEach((a) => {
//       const cost = (Number(a.hours) / 8) * (workerRate[a.workerId] || 0);
//       byDate[a.date] = (byDate[a.date] || 0) + cost;
//     });
//   return Object.entries(byDate)
//     .sort(([a], [b]) => (a < b ? -1 : 1))
//     .map(([date, cost]) => ({ date, cost: Math.round(cost) }));
// }

export function formatINR(amount) {
  const n = Math.round(Number(amount || 0));
  return '\u20B9' + n.toLocaleString('en-IN');
}

// Dates are stored as 'YYYY-MM-DD'; these only change how they're shown.
// Splitting the string (instead of new Date(iso)) avoids UTC shifting the day.

// '2026-08-01' -> 'Aug, 2026'
export function formatMonthYear(isoDate) {
  if (!isoDate) return '\u2014';
  const [year, month] = isoDate.split('-');
  const name = new Date(year, month - 1).toLocaleString('en-IN', { month: 'short' });
  return `${name}, ${year}`;
}

// '2026-08-01' -> '01-08-2026'
export function formatDMY(isoDate) {
  if (!isoDate) return '\u2014';
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
