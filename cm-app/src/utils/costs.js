// Pure calculation helpers shared across pages. Kept framework-free so they're easy to unit test.

// Cost categories used by estimates, expenses, totals and charts.
// Labour is entered by hand like the others (worker attendance is still disabled).
export const COST_CATEGORIES = ['Material', 'Labour', 'Overhead'];

// Placeholder text for the item box, per category.
export const CATEGORY_HINTS = {
  Material: 'Type e.g. cement, steel, sand…',
  Labour: 'e.g. Mason, helper, carpenter…',
  Overhead: 'e.g. Transport charges',
};

// Older data used the US spelling 'Labor'; treat it as 'Labour'.
export const normalizeCategory = (category) => (category === 'Labor' ? 'Labour' : category);

const emptyTotals = () => Object.fromEntries(COST_CATEGORIES.map((c) => [c, 0]));
const sumCategories = (totals) => COST_CATEGORIES.reduce((sum, c) => sum + (totals[c] || 0), 0);

// Estimate line items that count toward totals, with old 'Labor' items renamed to 'Labour'.
export function costItems(estimate) {
  return (estimate?.items || [])
    .map((item) => ({ ...item, category: normalizeCategory(item.category) }))
    .filter((item) => COST_CATEGORIES.includes(item.category));
}

export function estimateItemTotal(item) {
  return Number(item.quantity || 0) * Number(item.unitRate || 0);
}

export function estimateTotals(estimate) {
  const totals = emptyTotals();
  costItems(estimate).forEach((item) => {
    totals[item.category] += estimateItemTotal(item);
  });
  totals.grand = sumCategories(totals);
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
  const totals = emptyTotals();
  expenses
    .filter((e) => e.projectId === projectId && COST_CATEGORIES.includes(normalizeCategory(e.category)))
    .forEach((e) => {
      totals[normalizeCategory(e.category)] += Number(e.amount || 0);
    });
  return totals;
}

export function projectCostSummary(project, { estimates, expenses }) {
  const est = latestEstimate(estimates, project.id);
  const estTotals = est ? estimateTotals(est) : { ...emptyTotals(), grand: 0 };
  const actualExp = actualExpenseTotals(expenses, project.id);
  return {
    estimate: est,
    estimated: estTotals,
    actual: { ...actualExp, grand: sumCategories(actualExp) },
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
