import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/costs';

export default function AttendanceSheet({ project }) {
  const { state, dispatch } = useApp();
  const [date, setDate] = useState('2026-08-15');
  const [saved, setSaved] = useState(false);

  const assignedWorkers = useMemo(() => {
    const ids = state.projectWorkers
      .filter((pw) => pw.projectId === project.id)
      .map((pw) => pw.workerId);
    return state.workers.filter((w) => ids.includes(w.id));
  }, [state.projectWorkers, state.workers, project.id]);

  const existingForDate = useMemo(
    () => state.attendance.filter((a) => a.projectId === project.id && a.date === date),
    [state.attendance, project.id, date]
  );

  const [rows, setRows] = useState(() => buildRows(assignedWorkers, existingForDate));

  function buildRows(workers, existing) {
    const byWorker = Object.fromEntries(existing.map((a) => [a.workerId, a]));
    return workers.map((w) => ({
      workerId: w.id,
      present: byWorker[w.id]?.present ?? true,
      hours: byWorker[w.id]?.hours ?? 8,
    }));
  }

  function onDateChange(newDate) {
    setDate(newDate);
    setSaved(false);
    const existing = state.attendance.filter((a) => a.projectId === project.id && a.date === newDate);
    setRows(buildRows(assignedWorkers, existing));
  }

  function toggleRow(workerId) {
    setRows((rs) => rs.map((r) => (r.workerId === workerId ? { ...r, present: !r.present } : r)));
    setSaved(false);
  }
  function setHours(workerId, hours) {
    setRows((rs) => rs.map((r) => (r.workerId === workerId ? { ...r, hours } : r)));
    setSaved(false);
  }

  const dayCost = rows.reduce((sum, r) => {
    if (!r.present) return sum;
    const worker = state.workers.find((w) => w.id === r.workerId);
    return sum + (Number(r.hours) / 8) * (worker?.dailyRate || 0);
  }, 0);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({
      type: 'MARK_ATTENDANCE_BATCH',
      payload: { projectId: project.id, date, records: rows },
    });
    setSaved(true);
  }

  if (assignedWorkers.length === 0) {
    return (
      <p className="muted">
        No workers are assigned to this project yet. Assign workers from the Workers tab first.
      </p>
    );
  }

  return (
    <form className="attendance-sheet" onSubmit={handleSubmit}>
      <div className="attendance-sheet__toolbar">
        <label className="field field--inline">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </label>
        <div className="attendance-sheet__day-cost">
          Day's labor cost: <strong>{formatINR(dayCost)}</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Present</th>
              <th>Worker</th>
              <th>Role</th>
              <th>Hours</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const worker = state.workers.find((w) => w.id === r.workerId);
              const cost = r.present ? (Number(r.hours) / 8) * (worker?.dailyRate || 0) : 0;
              return (
                <tr key={r.workerId} className={!r.present ? 'table__row--muted' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={r.present}
                      onChange={() => toggleRow(r.workerId)}
                      aria-label={`Mark ${worker?.name} present`}
                    />
                  </td>
                  <td>{worker?.name}</td>
                  <td>{worker?.role}</td>
                  <td>
                    <input
                      type="number"
                      className="table__num-input"
                      min="0"
                      max="24"
                      step="0.5"
                      disabled={!r.present}
                      value={r.hours}
                      onChange={(e) => setHours(r.workerId, e.target.value)}
                    />
                  </td>
                  <td>{formatINR(cost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="form__actions">
        {saved && <span className="form__saved">Attendance saved for {date}</span>}
        <button type="submit" className="btn btn--primary">Save attendance</button>
      </div>
    </form>
  );
}
