import { createContext, useContext, useMemo, useReducer } from 'react';
import {
  DEFAULT_STATUSES,
  SEED_WORKERS,
  SEED_PROJECTS,
  SEED_PROJECT_WORKERS,
  SEED_ATTENDANCE,
  SEED_ESTIMATES,
  SEED_EXPENSES,
} from '../data/seedData';

const AppContext = createContext(null);

const initialState = {
  statuses: DEFAULT_STATUSES,
  workers: SEED_WORKERS,
  projects: SEED_PROJECTS,
  projectWorkers: SEED_PROJECT_WORKERS,
  attendance: SEED_ATTENDANCE,
  estimates: SEED_ESTIMATES,
  expenses: SEED_EXPENSES,
};

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PROJECT': {
      const project = { ...action.payload, id: nextId('p') };
      return { ...state, projects: [project, ...state.projects] };
    }
    case 'UPDATE_PROJECT_STATUS': {
      const { projectId, statusId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === projectId ? { ...p, statusId } : p)),
      };
    }
    case 'ADD_STATUS': {
      const status = { id: nextId('st'), name: action.payload.name, color: action.payload.color };
      return { ...state, statuses: [...state.statuses, status] };
    }
    case 'REORDER_STATUS': {
      const { index, direction } = action.payload;
      const list = [...state.statuses];
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= list.length) return state;
      [list[index], list[swapWith]] = [list[swapWith], list[index]];
      return { ...state, statuses: list };
    }
    case 'DELETE_STATUS': {
      const inUse = state.projects.some((p) => p.statusId === action.payload.id);
      if (inUse) return state;
      return { ...state, statuses: state.statuses.filter((s) => s.id !== action.payload.id) };
    }
    case 'ADD_WORKER': {
      const worker = { ...action.payload, id: nextId('w') };
      return { ...state, workers: [worker, ...state.workers] };
    }
    case 'ASSIGN_WORKER': {
      const { projectId, workerId, assignedDate } = action.payload;
      const already = state.projectWorkers.some(
        (pw) => pw.projectId === projectId && pw.workerId === workerId
      );
      if (already) return state;
      const assignment = { id: nextId('pw'), projectId, workerId, assignedDate };
      return { ...state, projectWorkers: [...state.projectWorkers, assignment] };
    }
    case 'REMOVE_ASSIGNMENT': {
      return {
        ...state,
        projectWorkers: state.projectWorkers.filter((pw) => pw.id !== action.payload.id),
      };
    }
    case 'MARK_ATTENDANCE_BATCH': {
      // payload: { projectId, date, records: [{ workerId, present, hours }] }
      const { projectId, date, records } = action.payload;
      const filtered = state.attendance.filter(
        (a) => !(a.projectId === projectId && a.date === date)
      );
      const additions = records.map((r) => ({
        id: nextId('att'),
        projectId,
        date,
        workerId: r.workerId,
        present: r.present,
        hours: r.hours,
      }));
      return { ...state, attendance: [...filtered, ...additions] };
    }
    case 'ADD_ESTIMATE_VERSION': {
      const { projectId, items } = action.payload;
      const existing = state.estimates.filter((e) => e.projectId === projectId);
      const nextVersion = existing.length ? Math.max(...existing.map((e) => e.version)) + 1 : 1;
      const estimate = {
        id: nextId('est'),
        projectId,
        version: nextVersion,
        createdDate: new Date().toISOString().slice(0, 10),
        items: items.map((it, i) => ({ ...it, id: nextId('ei') })),
      };
      return { ...state, estimates: [...state.estimates, estimate] };
    }
    case 'ADD_EXPENSE': {
      const expense = { ...action.payload, id: nextId('exp') };
      return { ...state, expenses: [expense, ...state.expenses] };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
