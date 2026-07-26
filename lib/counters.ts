import { doc, runTransaction, type Transaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Atomically reserves the next sequence number for a named counter
 * (stored at counters/{name}) inside an existing Firestore transaction.
 * Used to generate human-friendly, gap-free document numbers such as
 * ORD-000001 or INV-000001 without a separate round trip.
 */
export async function reserveNextSequence(transaction: Transaction, name: string): Promise<number> {
  const counterRef = doc(db, "counters", name);
  const snapshot = await transaction.get(counterRef);
  const current = typeof snapshot.data()?.seq === "number" ? snapshot.data()?.seq : 0;
  const next = (current ?? 0) + 1;
  transaction.set(counterRef, { seq: next }, { merge: true });
  return next;
}

/** Formats a sequence number with a prefix, e.g. formatSequence("ORD", 12) -> "ORD-000012". */
export function formatSequence(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(6, "0")}`;
}

/** Standalone (non-transactional) reservation, used when no other transaction is in flight. */
export async function getNextDocumentNumber(counterName: string, prefix: string): Promise<string> {
  return runTransaction(db, async (transaction) => {
    const seq = await reserveNextSequence(transaction, counterName);
    return formatSequence(prefix, seq);
  });
}
