import type { NextRequest } from "next/server";
import { getAdminAuth } from "./firebase-admin";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies the Firebase ID token sent by the client and returns the
 * decoded token (contains uid, email, etc.).
 *
 * SECURITY FIX (was): `/api/copilot` had no authentication at all — it was
 * a public endpoint that fetched every product/customer/order/invoice
 * record and forwarded it to Gemini for *anyone* who could reach the URL,
 * with no login required. That's both a data-exposure risk (your entire
 * business database, including customer PII, to any anonymous caller)
 * and a cost/abuse risk (unlimited free Gemini calls at your expense).
 *
 * FIX: every protected route now requires a valid Firebase ID token,
 * verified server-side with the Admin SDK (which also checks revocation).
 */
export async function requireAuth(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Missing or malformed Authorization header. Expected 'Bearer <idToken>'.", 401);
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, /* checkRevoked */ true);
    return decoded;
  } catch (error) {
  console.error("Firebase Auth Error:", error);
  throw new AuthError("Invalid or expired session. Please sign in again.");
}
}
