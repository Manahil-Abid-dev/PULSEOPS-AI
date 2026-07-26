import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rateLimit";
import { copilotRequestSchema, looksLikeInjectionAttempt, sanitizeUserContent } from "@/lib/validation";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";
import { metricsToPromptSummary } from "@/lib/businessMetrics";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session via Firebase ID Token
    let user;
    try {
      user = await requireAuth(req);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    // 2. Enforce per-user rate limiting
    const env = getServerEnv();
    const rate = checkRateLimit(`copilot:${user.uid}`, env.COPILOT_RATE_LIMIT_MAX, env.COPILOT_RATE_LIMIT_WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "You're sending messages too quickly. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } }
      );
    }

    // 3. Parse and validate JSON request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const parsed = copilotRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    // 4. Extract latest user message for security checks
    const lastUserMessage = [...parsed.data.history].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found in history." }, { status: 400 });
    }

    const content = sanitizeUserContent(lastUserMessage.content);

    if (looksLikeInjectionAttempt(content)) {
      console.warn(`[copilot] Possible prompt-injection attempt from uid=${user.uid}`);
    }

    // 5. Gather business metrics (PII-safe summarized data)
    const snapshot = await getBusinessSnapshot();
    const summary = metricsToPromptSummary(snapshot.metrics);

    // 6. Verify Groq API key and select model
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      console.error("[copilot] Missing GROQ_API_KEY in environment variables.");
      return NextResponse.json(
        { error: "Copilot AI service is currently unconfigured." },
        { status: 500 }
      );
    }

    // 7. Dispatch call to Groq API with full conversation history context
    const systemPrompt = `You are PulseOps AI Copilot, an enterprise AI operational analyst.
You assist business owners with data-grounded operations, analytics, and business health decisions.

CRITICAL INSTRUCTIONS:
- Answer using ONLY the business context provided below.
- Do NOT fabricate metrics, customer PII, or internal data.
- Maintain a professional, clear, and actionable tone.

CURRENT BUSINESS METRICS SUMMARY:
${summary}`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...parsed.data.history.map((m) => ({
        role: m.role,
        content: m.role === "user" ? sanitizeUserContent(m.content) : m.content,
      })),
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model, 
        messages: formattedMessages,
        temperature: 0.5,
      }),
    });

    const groqData = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("[copilot] Groq API Error:", groqData);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again shortly." },
        { status: groqResponse.status }
      );
    }

    const reply = groqData.choices?.[0]?.message?.content;

    return NextResponse.json({
      reply: reply || "I couldn't generate a response just now. Please try again.",
    });

  } catch (err) {
    console.error("[api/copilot] Unhandled error:", err);
    return NextResponse.json(
      { error: "Something went wrong processing your request. Please try again." },
      { status: 500 }
    );
  }
}