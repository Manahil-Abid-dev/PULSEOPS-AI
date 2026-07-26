"use client";

import { auth } from "@/lib/firebase";

/**
 * Returns a fresh Firebase ID token for the signed-in user, or null if
 * nobody is signed in. Used to authenticate calls to /api/dashboard and
 * /api/copilot, which now require a valid Bearer token (see lib/auth-server.ts).
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function requireIdToken(): Promise<string> {
  const token = await getIdToken();
  if (!token) {
    throw new Error("You need to be signed in to do that.");
  }
  return token;
}
