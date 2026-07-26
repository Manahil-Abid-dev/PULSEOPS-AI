import { z } from "zod";
import { getServerEnv } from "./env";

const MAX_MESSAGE_LENGTH = getServerEnv().COPILOT_MAX_MESSAGE_LENGTH;
const MAX_HISTORY_MESSAGES = getServerEnv().COPILOT_MAX_HISTORY_MESSAGES;

export const chatMessageSchema = z.object({
  id: z.string().max(200).optional(),
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(MAX_MESSAGE_LENGTH, `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`),
  timestamp: z.string().optional(),
});

export const copilotRequestSchema = z.object({
  history: z
    .array(chatMessageSchema)
    .min(1, "History is required.")
    .max(MAX_HISTORY_MESSAGES, `Conversation history is too long (max ${MAX_HISTORY_MESSAGES} messages per request).`),
});

/**
 * Patterns commonly used in prompt-injection / jailbreak attempts against
 * business copilots. This is a defense-in-depth *signal*, not a silver
 * bullet — the real protection is (a) the system prompt/guardrails
 * explicitly refusing these categories, (b) never interpolating raw
 * secrets into any prompt in the first place, and (c) least-privilege
 * data access. This layer just flags obviously hostile input early so it
 * can be logged and optionally short-circuited before spending a Gemini
 * call on it.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?)/i,
  /you\s+are\s+now\s+(chatgpt|gemini|claude|dan|developer\s*mode)/i,
  /reveal\s+(your\s+)?(system\s+prompt|hidden\s+prompt|instructions?|guardrails?)/i,
  /(show|print|output|leak)\s+(the\s+)?(api\s*key|env(ironment)?\s*variables?|service\s*account|credentials?|firebase\s*(key|config))/i,
  /developer\s*mode/i,
  /pretend\s+(to\s+be|you\s*'?\s*re)/i,
  /act\s+as\s+(if\s+you\s+)?(are\s+)?(an?\s+)?(unfiltered|uncensored|jailbroken)/i,
  /\bsystem\s*:\s*/i, // attempts to forge a fake system-role turn inside user content
];

export function looksLikeInjectionAttempt(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/** Strips characters/sequences with no legitimate use in a chat message and could be used to forge fake role markers in the prompt. */
export function sanitizeUserContent(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "") // control chars
    .trim();
}
