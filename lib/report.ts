import { adminDb } from "./firebase-admin";

export async function getReports() {
  const snapshot = await adminDb.collection("reports").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}