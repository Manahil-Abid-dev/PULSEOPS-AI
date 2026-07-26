import { adminDb } from "./firebase-admin";

export async function getUsers() {
  const snapshot = await adminDb.collection("users").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}