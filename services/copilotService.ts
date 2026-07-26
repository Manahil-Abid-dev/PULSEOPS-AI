import type { ChatMessage } from "@/types/chat";
import { requireIdToken } from "@/lib/clientAuth";

export async function generateCopilotReply(
  history: ChatMessage[]
): Promise<string> {
  try {
    const token = await requireIdToken();

    const response = await fetch("/api/copilot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ history }),
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = "Server Error";

      try {
        const error = JSON.parse(text);
        errorMessage = error.error || JSON.stringify(error);
      } catch {
        // Non-JSON body usually means the platform (not our route) served
        // its own error page (e.g. a killed/timed-out function) — never
        // show that raw markup to the user.
        const looksLikeHtml = /^\s*<(!doctype|html)/i.test(text);
        errorMessage = looksLikeHtml || !text
          ? "PulseOps AI is temporarily unavailable. Please try again in a moment."
          : text;
      }

      throw new Error(errorMessage);
    }

    if (!text) {
      throw new Error("Empty response from server.");
    }

    const data = JSON.parse(text);
    return data.reply;
  } catch (error) {
    console.error(error);
    // Re-throw so the UI can distinguish "failed" from a successful reply
    // and offer a Retry action instead of silently injecting a fake
    // assistant message into the conversation history.
    throw error instanceof Error ? error : new Error("Sorry, PulseOps AI is temporarily unavailable. Please try again.");
  }
}