// verify-firebase-admin.mjs
//
// Drop this into your pulseops-ai project root and run:
//   node verify-firebase-admin.mjs
//
// It loads .env.local exactly the way Next.js does, builds the Admin SDK
// credential exactly the way lib/firebase-admin.ts does, and then makes a
// REAL call to Firebase Auth (listUsers) — this is the only way to know
// for sure whether Google currently accepts the key, since a key can be
// perfectly well-formed PEM and still be revoked/inactive on Google's side.

import pkg from "@next/env";
const { loadEnvConfig } = pkg;
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

loadEnvConfig(process.cwd(), true);

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing one of FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local");
  process.exit(1);
}

console.log("Testing credential for:");
console.log("  project_id  :", projectId);
console.log("  client_email:", clientEmail);
console.log("");

try {
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const result = await getAuth(app).listUsers(1);
  console.log("SUCCESS — Google accepted the credential.");
  console.log(`Firebase Auth reports ${result.users.length === 1 ? "at least 1" : "0"} user(s) reachable.`);
} catch (err) {
  console.error("FAILED — Google rejected the credential.");
  console.error(err?.message ?? err);
  console.error("");
  console.error("If this still says invalid_grant / Invalid JWT Signature, the key you just");
  console.error("pasted into .env.local is not the currently active key for this service");
  console.error("account. Re-generate a fresh key in Firebase Console and try again.");
}
