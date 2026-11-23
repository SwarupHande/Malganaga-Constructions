import { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ACTION_LABELS } from '../utils/activity';

// Admin-only: everyone's activity, newest first. Shows the latest MAX_ENTRIES entries.
const MAX_ENTRIES = 500;

const formatWhen = (date) =>
  date
    ? date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export default function Activity() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return undefined;
    const q = query(collection(db, 'activityLogs'), orderBy('at', 'desc'), limit(MAX_ENTRIES));
    return onSnapshot(
      q,
      (snap) => {
        setLogs(
          snap.docs.map((d) => {
            // 'estimate' fills in the time for entries still being saved, so they sort correctly.
            const data = d.data({ serverTimestamps: 'estimate' });
            return { ...data, id: d.id, at: data.at?.toDate?.() ?? null };
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code === 'permission-denied' ? 'Only admins can view activity logs.' : `Could not load logs: ${err.message}`);
        setLoading(false);
      }
    );
  }, [isAdmin]);

  const users = useMemo(() => [...new Set(logs.map((l) => l.email))].sort(), [logs]);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter(
      (l) =>
        (!userFilter || l.email === userFilter) &&
        (!actionFilter || l.action === actionFilter) &&
        (!term || l.summary?.toLowerCase().includes(term))
    );
  }, [logs, userFilter, actionFilter, search]);

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Only admins can view activity logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="card">
        <div className="card__header-row">
          <h2 className="card__title">Activity log</h2>
          <span className="muted">{shown.length} of {logs.length} entries</span>
        </div>

        <div className="filter-bar">
          <label className="field">
            User
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Action
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All actions</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Search
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Project, item, name…" />
          </label>
        </div>

        {error && <div className="form__error" role="alert">{error}</div>}

        {loading ? (
          <p className="muted">Loading activity…</p>
        ) : shown.length === 0 ? (
          <p className="muted">{logs.length === 0 ? 'No activity recorded yet.' : 'No entries match these filters.'}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatWhen(l.at)}</td>
                    <td>{l.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{ACTION_LABELS[l.action] || l.action}</td>
                    <td>{l.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {logs.length === MAX_ENTRIES && (
          <p className="muted">Showing the latest {MAX_ENTRIES} entries. Older entries are in Firebase Console → Firestore → activityLogs.</p>
        )}
      </section>
    </div>
  );
}
