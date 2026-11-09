import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_STATUSES, SEED_PROJECTS, SEED_ESTIMATES, SEED_EXPENSES, SEED_TEAM } from './seedData';

// One-time upload of the sample data. Safe to run twice: same IDs just overwrite.
export async function seedFirestore() {
  const batch = writeBatch(db);

  // Store each item under its existing id ('p-1', 'tm-1'...) so links between them still match.
  const put = (collectionName, items) =>
    items.forEach(({ id, ...data }) => batch.set(doc(db, collectionName, id), data));
  put('projects', SEED_PROJECTS);
  put('estimates', SEED_ESTIMATES);
  put('expenses', SEED_EXPENSES);
  put('team', SEED_TEAM);
  batch.set(doc(db, 'settings', 'statuses'), { list: DEFAULT_STATUSES });
  await batch.commit();
}
