import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ReportExportFormat, ReportExportType } from "@/types/report";

const COLLECTION = "reports";

/**
 * Records an audit-trail entry in Firestore every time a report is
 * exported. Report data itself is always computed live from the
 * orders/invoices/products/customers collections (so it can never go
 * stale) — this collection just preserves a history of who generated
 * which export and when.
 */
export async function logReportExport(type: ReportExportType, format: ReportExportFormat): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    type,
    format,
    generatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}
