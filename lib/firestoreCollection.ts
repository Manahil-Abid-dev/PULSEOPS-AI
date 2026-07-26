import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Generic Firestore collection helper.
 *
 * Every module in this app (customers, products, ...) stores plain records
 * with a `createdAt` field. Centralizing subscribe/add/update/delete here
 * keeps each domain service a thin, typed wrapper instead of duplicating
 * Firestore boilerplate.
 */
export function createFirestoreCollection<T extends { id: string; createdAt: string }>(
  collectionName: string,
  fromDoc: (snapshot: QueryDocumentSnapshot<DocumentData>) => T
) {
  const colRef = collection(db, collectionName);

  function subscribe(onData: (items: T[]) => void, onError: (message: string) => void) {
    const q = query(colRef, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        onData(snapshot.docs.map(fromDoc));
      },
      (err) => {
        onError(err.message || "Failed to load data from Firebase.");
      }
    );
  }

  async function add(data: Record<string, unknown>): Promise<string> {
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async function update(id: string, data: Record<string, unknown>): Promise<void> {
    await updateDoc(doc(db, collectionName, id), data);
  }

  async function remove(id: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, id));
  }

  return { subscribe, add, update, remove };
}

/** Safely converts a Firestore Timestamp (or missing value) to an ISO string. */
export function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}
