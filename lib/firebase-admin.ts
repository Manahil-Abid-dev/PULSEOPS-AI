import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getServerEnv } from "./env";

/**
 * Firebase Admin SDK initialization.
 *
 * SECURITY FIX (was): credentials were loaded from a committed JSON key
 * file (`lib/pulseops-ai-*-firebase-adminsdk-*.json`) that shipped inside
 * the repo/zip. That file is a live private key with full Firestore admin
 * access — anyone with the file (or the archive it was bundled in) could
 * read/write the entire database with no restrictions.
 *
 * FIX: credentials now come from environment variables
 * (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY),
 * which are never committed to source control.
 *
 * ACTION REQUIRED FROM YOU:
 * 1. In Firebase Console -> Project Settings -> Service Accounts, click
 *    "Generate new private key" to issue a fresh key, then go to the
 *    IAM page and revoke/delete the old key that was in the JSON file
 *    (the old one must be treated as compromised since it left your
 *    machine inside a shareable archive).
 * 2. Put the new key's project_id / client_email / private_key into
 *    .env.local using the names above (see .env.example).
 * 3. Delete the old JSON file from disk and from git history if it was
 *    ever committed. Search history with:
 *    git log --all --full-history -- "lib/*firebase-adminsdk*.json"
 */

function buildAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const env = getServerEnv();

  // Clean and format the private key to handle double-quotes and escaped newlines
  const formattedPrivateKey = env.FIREBASE_PRIVATE_KEY
    ? env.FIREBASE_PRIVATE_KEY
        .replace(/^["']|["']$/g, "") // Strip leading & trailing quotes if passed through
        .replace(/\\n/g, "\n")      // Convert escaped \n into actual line breaks
    : "";

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedPrivateKey,
    }),
  });
}
let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getApp(): App {
  if (!_app) _app = buildAdminApp();
  return _app;
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

// Kept for backwards compatibility with existing imports (`adminDb`) elsewhere
// in the codebase (lib/product.ts, lib/customer.ts, etc.) so this fix doesn't
// require touching every call site.
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    // @ts-expect-error - dynamic proxy forwarding
    const value = db[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});
