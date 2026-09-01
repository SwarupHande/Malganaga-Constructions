export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge badge--${status.color}`}>{status.name}</span>;
}
