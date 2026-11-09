// Recharts needs literal colours, so these mirror the tokens in index.css.
export const CHART_COLORS = {
  grid: 'rgba(23, 25, 29, 0.08)',
  muted: '#c6bfae',
  primary: '#1f3a5f',
  accent: '#c8502a',
  teal: '#2f6f68',
  tick: '#6b6a63',
};

export const PIE_COLORS = {
  Material: CHART_COLORS.primary,
  Labor: CHART_COLORS.accent,
  Overhead: CHART_COLORS.teal,
};

export const AXIS_TICK = { fontSize: 12, fill: CHART_COLORS.tick };

export const TOOLTIP_STYLE = {
  background: '#fbfaf6',
  border: '1px solid #c6bfae',
  borderRadius: 4,
  boxShadow: '0 10px 24px -12px rgba(23, 25, 29, 0.35)',
  fontSize: 13,
};

export const BAR_RADIUS = [2, 2, 0, 0];
