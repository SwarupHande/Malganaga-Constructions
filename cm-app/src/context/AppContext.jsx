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

// App data lives in Firestore:
//   projects/{id}   - stageManagers: { [statusId]: memberId } is stored on the project
//   estimates/{id}, expenses/{id}, team/{id}
//   settings/statuses - { list: [...] } so stage order is kept
// Pages still call dispatch({ type, payload }); dispatch now writes to Firestore and the
// live onSnapshot listeners below push the change back into state (instantly, for local writes).

const AppContext = createContext(null);

const COLLECTIONS = ['projects', 'estimates', 'expenses', 'team'];
const SOURCES = [...COLLECTIONS, 'statuses'];
const statusesRef = doc(db, 'settings', 'statuses');

const EMPTY = {
  statuses: [],
  projects: [],
  estimates: [],
  expenses: [],
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
  team: (a, b) => a.name.localeCompare(b.name),
};

function shortId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(EMPTY);
  const [loaded, setLoaded] = useState(() => new Set());
  const [error, setError] = useState('');

  // Subscribe while signed in; drop everything on sign-out.
  useEffect(() => {
    if (!user) {
      setState(EMPTY);
      setLoaded(new Set());
      return undefined;
    }
    const markLoaded = (key) => setLoaded((s) => (s.has(key) ? s : new Set(s).add(key)));
    const onError = (err) => {
      console.error(err);
      setError(
        err.code === 'permission-denied'
          ? 'You do not have access to this data. Ask the admin to add your account.'
          : `Could not load data: ${err.message}`
      );
    };

    const unsubs = COLLECTIONS.map((name) =>
      onSnapshot(
        collection(db, name),
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
          setState((s) => ({ ...s, statuses: snap.data()?.list || [] }));
          markLoaded('statuses');
        },
        onError
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const write = useCallback(
    async (action) => {
      const { type, payload } = action;
      switch (type) {
        case 'ADD_PROJECT':
          return addDoc(collection(db, 'projects'), {
            stageManagers: {},
            ...payload,
            createdAt: serverTimestamp(),
          });
        case 'UPDATE_PROJECT_STATUS':
          return updateDoc(doc(db, 'projects', payload.projectId), { statusId: payload.statusId });

        case 'ADD_STATUS': {
          const status = { id: shortId('st'), name: payload.name, color: payload.color };
          return setDoc(statusesRef, { list: [...state.statuses, status] });
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
          return addDoc(collection(db, 'estimates'), {
            projectId,
            version,
            createdDate: new Date().toISOString().slice(0, 10),
            items: items.map((it, i) => ({ ...it, id: `ei-${i + 1}` })),
            createdAt: serverTimestamp(),
          });
        }
        case 'ADD_EXPENSE':
          return addDoc(collection(db, 'expenses'), { ...payload, createdAt: serverTimestamp() });

        case 'ADD_MEMBER':
          return addDoc(collection(db, 'team'), { ...payload, createdAt: serverTimestamp() });
        case 'REMOVE_MEMBER': {
          // Delete the member and clear them from every stage they manage, all in one batch.
          const batch = writeBatch(db);
          batch.delete(doc(db, 'team', payload.id));
          state.projects.forEach((p) => {
            Object.entries(p.stageManagers || {}).forEach(([statusId, memberId]) => {
              if (memberId === payload.id) {
                batch.update(doc(db, 'projects', p.id), new FieldPath('stageManagers', statusId), deleteField());
              }
            });
          });
          return batch.commit();
        }
        case 'ASSIGN_STAGE_MANAGER': {
          // FieldPath (not 'stageManagers.st-1') so stage ids are never misread as nested paths.
          const { projectId, statusId, memberId } = payload;
          return updateDoc(
            doc(db, 'projects', projectId),
            new FieldPath('stageManagers', statusId),
            memberId || deleteField()
          );
        }

        default:
          console.warn(`Unknown or disabled action: ${type}`);
          return undefined;
      }
    },
    [state]
  );

  // Same call shape pages already use; failures surface as a banner instead of vanishing.
  const dispatch = useCallback(
    (action) =>
      write(action).catch((err) => {
        console.error(err);
        setError(`Could not save: ${err.message}`);
      }),
    [write]
  );

  const loading = Boolean(user) && SOURCES.some((k) => !loaded.has(k)) && !error;

  const value = useMemo(
    () => ({ state, dispatch, loading, error, clearError: () => setError('') }),
    [state, dispatch, loading, error]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
