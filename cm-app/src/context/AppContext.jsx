import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteField,
  doc,
  FieldPath,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { DEFAULT_STATUSES } from '../data/seedData';
import { describeAction, logActivity } from '../utils/activity';

// Each user's data lives in their own folder in Firestore, so every login sees only its own data:
//   users/{uid}/projects/{id}   - stageManagers: { [statusId]: memberId } is stored on the project
//   users/{uid}/estimates/{id}, users/{uid}/expenses/{id}, users/{uid}/team/{id}
//   users/{uid}/payments/{id}   - money received from the client: { projectId, amount, date, mode, note }
//   users/{uid}/settings/statuses - { list: [...] } so stage order is kept
// Pages still call dispatch({ type, payload }); dispatch now writes to Firestore and the
// live onSnapshot listeners below push the change back into state (instantly, for local writes).

const AppContext = createContext(null);

const COLLECTIONS = ['projects', 'estimates', 'expenses', 'payments', 'team'];
const SOURCES = [...COLLECTIONS, 'statuses'];

const EMPTY = {
  statuses: [],
  projects: [],
  estimates: [],
  expenses: [],
  payments: [],
  team: [],
  // Worker features are disabled; kept empty so any leftover reads don't crash.
  workers: [],
  projectWorkers: [],
  attendance: [],
};

// Newest first for projects (seeded docs have no createdAt and keep their id order).
const SORTERS = {
  projects: (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0) || a.id.localeCompare(b.id),
  expenses: (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
  payments: (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
  team: (a, b) => a.name.localeCompare(b.name),
};

function shortId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  // Every path points inside the signed-in user's own folder.
  const col = useCallback((name) => collection(db, 'users', uid, name), [uid]);
  const ref = useCallback((name, id) => doc(db, 'users', uid, name, id), [uid]);
  const statusesRef = useMemo(() => (uid ? doc(db, 'users', uid, 'settings', 'statuses') : null), [uid]);
  const [state, setState] = useState(EMPTY);
  const [loaded, setLoaded] = useState(() => new Set());
  const [error, setError] = useState(''); // save errors: shown as a dismissible banner
  const [loadError, setLoadError] = useState(''); // can't read data at all: blocks the app

  // Subscribe while signed in; drop everything on sign-out.
  useEffect(() => {
    if (!user) {
      setState(EMPTY);
      setLoaded(new Set());
      setLoadError('');
      return undefined;
    }
    const markLoaded = (key) => setLoaded((s) => (s.has(key) ? s : new Set(s).add(key)));
    const onError = (err) => {
      console.error(err);
      setLoadError(
        err.code === 'permission-denied'
          ? 'You do not have access to this data. Ask the admin to add your account.'
          : `Could not load data: ${err.message}`
      );
    };

    const unsubs = COLLECTIONS.map((name) =>
      onSnapshot(
        col(name),
        (snap) => {
          const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          if (SORTERS[name]) items.sort(SORTERS[name]);
          setState((s) => ({ ...s, [name]: items }));
          markLoaded(name);
        },
        onError
      )
    );
    unsubs.push(
      onSnapshot(
        statusesRef,
        (snap) => {
          if (!snap.exists()) {
            // First login for this user: give them the default stages.
            setDoc(statusesRef, { list: DEFAULT_STATUSES }).catch(onError);
            return;
          }
          setState((s) => ({ ...s, statuses: snap.data().list || [] }));
          markLoaded('statuses');
        },
        onError
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [user, col, statusesRef]);

  const write = useCallback(
    async (action) => {
      const { type, payload } = action;
      switch (type) {
        case 'ADD_PROJECT':
          return addDoc(col('projects'), {
            stageManagers: {},
            ...payload,
            createdAt: serverTimestamp(),
          });
        case 'UPDATE_PROJECT':
          return updateDoc(ref('projects', payload.projectId), {
            ...payload.changes,
            ...('budget' in payload.changes ? { budgetUpdatedAt: serverTimestamp() } : {}),
            updatedAt: serverTimestamp(),
          });
        case 'UPDATE_PROJECT_BUDGET':
          return updateDoc(ref('projects', payload.projectId), {
            budget: payload.budget,
            budgetUpdatedAt: serverTimestamp(),
          });
        case 'UPDATE_PROJECT_STATUS':
          return updateDoc(ref('projects', payload.projectId), { statusId: payload.statusId });

        case 'ADD_STATUS': {
          const taken = state.statuses.some((s) => s.name.trim().toLowerCase() === payload.name.trim().toLowerCase());
          if (taken) return undefined;
          const status = { id: shortId('st'), name: payload.name, color: payload.color };
          const list = payload.atStart ? [status, ...state.statuses] : [...state.statuses, status];
          return setDoc(statusesRef, { list });
        }
        case 'REORDER_STATUS': {
          const { index, direction } = payload;
          const list = [...state.statuses];
          const swapWith = index + direction;
          if (swapWith < 0 || swapWith >= list.length) return undefined;
          [list[index], list[swapWith]] = [list[swapWith], list[index]];
          return setDoc(statusesRef, { list });
        }
        case 'DELETE_STATUS': {
          const inUse = state.projects.some((p) => p.statusId === payload.id);
          if (inUse) return undefined;
          return setDoc(statusesRef, { list: state.statuses.filter((s) => s.id !== payload.id) });
        }

        case 'ADD_ESTIMATE_VERSION': {
          const { projectId, items } = payload;
          const existing = state.estimates.filter((e) => e.projectId === projectId);
          const version = existing.length ? Math.max(...existing.map((e) => e.version)) + 1 : 1;
          return addDoc(col('estimates'), {
            projectId,
            version,
            createdDate: new Date().toISOString().slice(0, 10),
            items: items.map((it, i) => ({ ...it, id: `ei-${i + 1}` })),
            ...(payload.basedOnVersion ? { basedOnVersion: payload.basedOnVersion } : {}),
            createdAt: serverTimestamp(),
          });
        }
        case 'ADD_EXPENSE':
          return addDoc(col('expenses'), { ...payload, createdAt: serverTimestamp() });
        case 'ADD_PAYMENT':
          return addDoc(col('payments'), { ...payload, createdAt: serverTimestamp() });

        case 'ADD_MEMBER':
          return addDoc(col('team'), { ...payload, createdAt: serverTimestamp() });
        case 'REMOVE_MEMBER': {
          // Delete the member and clear them from every stage they manage, all in one batch.
          const batch = writeBatch(db);
          batch.delete(ref('team', payload.id));
          state.projects.forEach((p) => {
            Object.entries(p.stageManagers || {}).forEach(([statusId, memberId]) => {
              if (memberId === payload.id) {
                batch.update(ref('projects', p.id), new FieldPath('stageManagers', statusId), deleteField());
              }
            });
          });
          return batch.commit();
        }
        case 'ASSIGN_STAGE_MANAGER': {
          // FieldPath (not 'stageManagers.st-1') so stage ids are never misread as nested paths.
          const { projectId, statusId, memberId } = payload;
          return updateDoc(
            ref('projects', projectId),
            new FieldPath('stageManagers', statusId),
            memberId || deleteField()
          );
        }

        default:
          console.warn(`Unknown or disabled action: ${type}`);
          return undefined;
      }
    },
    [state, col, ref, statusesRef]
  );

  // Same call shape pages already use; failures surface as a banner instead of vanishing.
  // Every successful change is also recorded in the activity log (no-op actions return undefined).
  const dispatch = useCallback(
    (action) => {
      const summary = describeAction(action, state); // describe using the data before the change
      return write(action)
        .then((result) => {
          if (result !== undefined) logActivity(user, action.type, summary);
          return result;
        })
        .catch((err) => {
          console.error(err);
          setError(`Could not save: ${err.message}`);
        });
    },
    [write, state, user]
  );

  const loading = Boolean(user) && SOURCES.some((k) => !loaded.has(k)) && !loadError;

  const value = useMemo(
    () => ({ state, dispatch, loading, loadError, error, clearError: () => setError('') }),
    [state, dispatch, loading, loadError, error]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
