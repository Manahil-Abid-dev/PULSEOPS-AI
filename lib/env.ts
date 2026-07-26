/**
 * Centralized, fail-fast environment variable access.
 *
 * WHY THIS FILE EXISTS:
 * Previously, missing env vars (e.g. GEMINI_API_KEY) were only discovered
 * deep inside a route handler, and the Firebase Admin credentials were
 * loaded from a committed JSON file instead of the environment at all.
 * This module is the single place that reads process.env, validates
 * shape, and throws a clear, actionable error at boot/first-use instead
 * of leaking undefined values into Firebase/Gemini clients.
 *
 * SECURITY NOTE:
 * Never log the *values* of these variables. Only log which named
 * variable is missing.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Add it to .env.local (development) or your hosting provider's ` +
        `environment settings (production). See .env.example for the full list.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

/** Server-only secrets. Importing this file from client code will throw at build time via Next's env scoping, but we double-guard anyway. */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("[env] getServerEnv() must never be called from client-side code.");
  }

  return {
    GROQ_API_KEY: required("GROQ_API_KEY"),
    // Overridable so a model retirement/rename on xAI's side never requires
    // a code change — just update the env var. Defaults to grok-4.3, xAI's
    // current, actively-supported model (see lib/aiClient.ts for details on
    // why grok-4.1-fast was retired and is no longer a valid slug).
    GROQ_MODEL: optional("GROQ_MODEL", "llama-3.1-8b-instant"),
    AUTOMATION_API_KEY: required("AUTOMATION_API_KEY"),

    // Firebase Admin SDK credentials — sourced from env vars, never a committed JSON key file.
    FIREBASE_PROJECT_ID: required("FIREBASE_PROJECT_ID"),
    FIREBASE_CLIENT_EMAIL: required("FIREBASE_CLIENT_EMAIL"),
    // Private keys are usually stored with literal "\n" sequences in .env files;
    // they must be converted back to real newlines before use.
    FIREBASE_PRIVATE_KEY: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),

    // Tunable security knobs, all optional with safe defaults.
    COPILOT_MAX_MESSAGE_LENGTH: Number(optional("COPILOT_MAX_MESSAGE_LENGTH", "2000")),
    COPILOT_MAX_HISTORY_MESSAGES: Number(optional("COPILOT_MAX_HISTORY_MESSAGES", "20")),
    COPILOT_RATE_LIMIT_MAX: Number(optional("COPILOT_RATE_LIMIT_MAX", "15")),
    COPILOT_RATE_LIMIT_WINDOW_MS: Number(optional("COPILOT_RATE_LIMIT_WINDOW_MS", String(60_000))),
    DASHBOARD_SNAPSHOT_CACHE_MS: Number(optional("DASHBOARD_SNAPSHOT_CACHE_MS", String(30_000))),
  };
}

/** Public (client-safe) Firebase config. These values are meant to be public — Firestore/Auth security is enforced by security rules, not by hiding this config. */
export function getClientEnv() {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
