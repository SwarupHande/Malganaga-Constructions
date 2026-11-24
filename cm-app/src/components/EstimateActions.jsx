import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { openBomReport } from '../utils/bomReport';

// "Edit" + "Download BOM" buttons shown above an estimate version's table.
export default function EstimateActions({ project, estimate, onEdit }) {
  const { state } = useApp();
  const { user } = useAuth();

  function downloadBom() {
    const stageName = state.statuses.find((s) => s.id === project.statusId)?.name;
    const preparedBy = user?.displayName || user?.email || '';
    const opened = openBomReport({ project, estimate, stageName, preparedBy });
    if (!opened) window.alert('Please allow pop-ups for this site to download the BOM report.');
  }

  return (
    <div className="estimate-actions">
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(estimate)}>
        Edit
      </button>
      <button type="button" className="btn btn--primary btn--sm" onClick={downloadBom}>
        Download BOM report
      </button>
    </div>
  );
}
