export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string; // ISO date string
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
}
