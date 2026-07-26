import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-server";
import { getServerEnv } from "@/lib/env";

/**
 * The /api/automation/* routes (briefing, alerts, dormant-customers, sync)
 * are protected by a static x-automation-key header meant for
 * server-to-server callers (n8n/cron) — that key must never reach the
 * browser bundle. This route lets an authenticated dashboard user (Firebase
 * ID token, same as /api/copilot) trigger those automations on demand: it
 * verifies the user server-side, then forwards the request internally with
 * the shared secret attached, and relays the JSON result back to the client.
 */
const ACTIONS = {
  briefing: "/api/automation/briefing",
  alerts: "/api/automation/alerts",
  winback: "/api/automation/dormant-customers",
  sync: "/api/automation/sync",
} as const;

type Action = keyof typeof ACTIONS;

export async function POST(req: NextRequest) {
  try {
    try {
      await requireAuth(req);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const action = (body as { action?: string })?.action as Action | undefined;
    if (!action || !(action in ACTIONS)) {
      return NextResponse.json(
        { error: `Invalid action. Expected one of: ${Object.keys(ACTIONS).join(", ")}` },
        { status: 400 }
      );
    }

    const targetPath = ACTIONS[action];
    const upstream = await fetch(new URL(targetPath, req.nextUrl.origin), {
      method: "GET",
      headers: { "x-automation-key": getServerEnv().AUTOMATION_API_KEY },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // Upstream returned something non-JSON (e.g. an infra error page) —
      // never forward that raw markup to the client.
      data = { error: "The automation service returned an unexpected response." };
    }

    if (!upstream.ok) {
      const message = (data as { error?: string })?.error ?? "The automation failed to run.";
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/automation/trigger] unhandled error:", err);
    return NextResponse.json(
      { error: "Something went wrong triggering that automation. Please try again." },
      { status: 500 }
    );
  }
}