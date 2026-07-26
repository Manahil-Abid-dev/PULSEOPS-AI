import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "./env";

/** Shared guard for the /api/automation/* routes. These are called by n8n,
 * not a signed-in browser user, so they authenticate via a static shared
 * secret header instead of a Firebase ID token. */
export function requireAutomationKey(req: NextRequest): NextResponse | null {
  const key = req.headers.get("x-automation-key");
  if (!key || key !== getServerEnv().AUTOMATION_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}