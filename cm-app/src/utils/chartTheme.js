// Recharts needs literal colours, so these mirror the tokens in index.css.
export const CHART_COLORS = {
  grid: 'rgba(40, 52, 72, 0.08)',
  muted: '#9db4d0',
  primary: '#34598a',
  accent: '#e07a3a',
  teal: '#3f8f86',
  tick: '#5f6878',
};

export const PIE_COLORS = {
  Material: CHART_COLORS.primary,
  Labor: CHART_COLORS.accent,
  Overhead: CHART_COLORS.teal,
};

export const AXIS_TICK = { fontSize: 12, fill: CHART_COLORS.tick };

export const TOOLTIP_STYLE = {
  background: '#e9edf2',
  border: 'none',
  borderRadius: 12,
  boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.6), -6px -6px 14px rgba(255, 255, 255, 0.9)',
  fontSize: 13,
};

export const BAR_RADIUS = [6, 6, 0, 0];
