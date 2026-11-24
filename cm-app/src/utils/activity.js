import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { formatINR } from './costs';

// Activity log: one doc per action in the top-level `activityLogs` collection.
// Anyone signed in can add their own entries; only admins (admins/{uid} exists) can read them,
// and nobody can edit or delete them (see firestore.rules).

export const ACTION_LABELS = {
  LOGIN: 'Signed in',
  LOGOUT: 'Signed out',
  ADD_PROJECT: 'Project added',
  UPDATE_PROJECT: 'Project details edited',
  UPDATE_PROJECT_BUDGET: 'Project budget changed',
  UPDATE_PROJECT_STATUS: 'Project stage changed',
  ADD_STATUS: 'Stage added',
  REORDER_STATUS: 'Stage reordered',
  DELETE_STATUS: 'Stage deleted',
  ADD_ESTIMATE_VERSION: 'Estimate saved',
  ADD_EXPENSE: 'Expense added',
  ADD_PAYMENT: 'Payment received',
  ADD_MEMBER: 'Team member added',
  REMOVE_MEMBER: 'Team member removed',
  ASSIGN_STAGE_MANAGER: 'Stage manager changed',
};

// Logging must never break the app: failures are only reported in the console.
export function logActivity(user, action, summary) {
  if (!user) return Promise.resolve();
  return addDoc(collection(db, 'activityLogs'), {
    uid: user.uid,
    email: user.email ?? '',
    action,
    summary,
    at: serverTimestamp(),
  }).catch((err) => console.warn('Could not write activity log:', err));
}

// Human-readable line for an app action, using the data as it was before the change.
export function describeAction({ type, payload }, state) {
  const project = (id) => `"${state.projects.find((p) => p.id === id)?.name ?? 'Unknown project'}"`;
  const stage = (id) => `"${state.statuses.find((s) => s.id === id)?.name ?? 'Unknown stage'}"`;
  const member = (id) => state.team.find((m) => m.id === id)?.name ?? 'Unknown member';

  switch (type) {
    case 'ADD_PROJECT':
      return `Added project "${payload.name}" (budget ${formatINR(payload.budget)})`;
    case 'UPDATE_PROJECT': {
      const before = state.projects.find((p) => p.id === payload.projectId) || {};
      const c = payload.changes;
      const place = (l) => (l ? [l.village, l.taluka, l.district, l.state].filter(Boolean).join(', ') : '—');
      const parts = [];
      if ('name' in c) parts.push(`name "${before.name}" → "${c.name}"`);
      if ('budget' in c) parts.push(`budget ${formatINR(before.budget ?? 0)} → ${formatINR(c.budget)}`);
      if ('startDate' in c) parts.push(`start date ${before.startDate || '—'} → ${c.startDate}`);
      if ('location' in c) parts.push(`location ${place(before.location)} → ${place(c.location)}`);
      if ('description' in c) parts.push('description');
      const text = `Edited "${before.name ?? 'Unknown project'}": ${parts.join('; ')}`;
      return text.length > 480 ? `${text.slice(0, 477)}...` : text;
    }
    case 'UPDATE_PROJECT_BUDGET': {
      const old = state.projects.find((p) => p.id === payload.projectId)?.budget;
      const reason = payload.reason ? ` — ${payload.reason}` : '';
      return `Changed budget of ${project(payload.projectId)} from ${formatINR(old ?? 0)} to ${formatINR(payload.budget)}${reason}`;
    }
    case 'UPDATE_PROJECT_STATUS': {
      const from = state.projects.find((p) => p.id === payload.projectId)?.statusId;
      return `Moved ${project(payload.projectId)} from ${stage(from)} to ${stage(payload.statusId)}`;
    }
    case 'ADD_STATUS':
      return `Added stage "${payload.name}"${payload.atStart ? ' at the start' : ''}`;
    case 'REORDER_STATUS': {
      const s = state.statuses[payload.index];
      return `Moved stage "${s?.name ?? 'Unknown stage'}" ${payload.direction < 0 ? 'up' : 'down'}`;
    }
    case 'DELETE_STATUS':
      return `Deleted stage ${stage(payload.id)}`;
    case 'ADD_ESTIMATE_VERSION': {
      const versions = state.estimates.filter((e) => e.projectId === payload.projectId).map((e) => e.version);
      const version = versions.length ? Math.max(...versions) + 1 : 1;
      const edited = payload.basedOnVersion ? `, edited from v${payload.basedOnVersion}` : '';
      return `Saved estimate v${version} for ${project(payload.projectId)} (${payload.items.length} items${edited})`;
    }
    case 'ADD_EXPENSE':
      return `Added ${payload.category} expense "${payload.description}" of ${formatINR(payload.amount)} to ${project(payload.projectId)}`;
    case 'ADD_PAYMENT':
      return `Recorded payment of ${formatINR(payload.amount)} received for ${project(payload.projectId)}`;
    case 'ADD_MEMBER':
      return `Added team member "${payload.name}" (${payload.role})`;
    case 'REMOVE_MEMBER':
      return `Removed team member "${member(payload.id)}"`;
    case 'ASSIGN_STAGE_MANAGER':
      return payload.memberId
        ? `Assigned ${member(payload.memberId)} to stage ${stage(payload.statusId)} on ${project(payload.projectId)}`
        : `Removed the manager of stage ${stage(payload.statusId)} on ${project(payload.projectId)}`;
    default:
      return type;
  }
}
