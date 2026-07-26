"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FirebaseConnectionStatus = "checking" | "online" | "offline";

interface UseFirebaseStatusResult {
  status: FirebaseConnectionStatus;
  projectId: string;
}

/**
 * Reports whether the client currently has a live connection to Firestore by
 * watching a snapshot's cache metadata — `fromCache: false` means the server
 * confirmed the read, `fromCache: true` (after the first response) means
 * we're serving from the local cache while offline.
 */
export function useFirebaseStatus(): UseFirebaseStatusResult {
  const [status, setStatus] = useState<FirebaseConnectionStatus>("checking");
  const projectId = (db.app.options.projectId as string) || "unknown-project";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "system", "status"),
      { includeMetadataChanges: true },
      (snapshot) => {
        setStatus(snapshot.metadata.fromCache ? "offline" : "online");
      },
      () => {
        setStatus("offline");
      }
    );
    return unsubscribe;
  }, []);

  return { status, projectId };
}
