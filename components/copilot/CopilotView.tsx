"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Send, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatMessage } from "@/components/copilot/ChatMessage";
import { TypingIndicator } from "@/components/copilot/TypingIndicator";
import { SuggestedPrompts } from "@/components/copilot/SuggestedPrompts";
import { useToast } from "@/components/providers/ToastProvider";
import { generateCopilotReply } from "@/services/copilotService";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

let idCounter = 0;
function nextId() {
  return `msg-${Date.now()}-${idCounter++}`;
}

const STORAGE_KEY = "pulseops:copilot:messages";

/** Wrapper required because useSearchParams() must be read inside a Suspense boundary in the app router. */
export function CopilotView() {
  return (
    <Suspense fallback={null}>
      <CopilotViewInner />
    </Suspense>
  );
}

function CopilotViewInner() {
  // Start empty on both server and client so the first client render matches
  // the server-rendered HTML exactly. Saved history (if any) is loaded in a
  // useEffect below, which only ever runs client-side, after hydration.
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [failedMessage, setFailedMessage] = useState<{ content: string; error: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const consumedDeepLink = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Load saved history from sessionStorage AFTER mount (client-only). Reading
  // window.sessionStorage during the initial render/state-init previously
  // caused a hydration mismatch (server always rendered messages=[], but the
  // client's very first render could immediately have messages.length > 0,
  // making the "Clear chat" button appear/disappear inconsistently).
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved) as ChatMessageType[]);
    } catch {
      // sessionStorage can throw in private-browsing edge cases; not worth surfacing to the user.
    }
    setIsHydrated(true);
  }, []);

  // Conversation persistence (task: UX Improvements). Session-scoped by
  // design — a shared/kiosk browser won't leak one user's business
  // questions into the next tab session indefinitely.
  // Guarded by isHydrated so this doesn't fire with the initial empty array
  // before the load effect above has had a chance to restore saved history.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // sessionStorage can throw in private-browsing edge cases; not worth surfacing to the user.
    }
  }, [messages, isHydrated]);

  // Deep-link support: Quick Actions on the dashboard link to
  // /copilot?q=<prompt> so "Analyze Business", "Business Risks", etc.
  // land here and fire immediately.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !consumedDeepLink.current) {
      consumedDeepLink.current = true;
      sendMessage(q);
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isThinking) return;

    setFailedMessage(null);

    const userMessage: ChatMessageType = {
      id: nextId(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await generateCopilotReply(nextMessages);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: reply, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't get a response. Please try again.";
      setFailedMessage({ content: trimmed, error: message });
      showToast("error", "Copilot is unavailable", message);
    } finally {
      setIsThinking(false);
    }
  }

  function retryLastMessage() {
    if (!failedMessage) return;
    // Remove the user message that failed so retrying doesn't duplicate it, then resend.
    setMessages((prev) => prev.filter((m) => m.content !== failedMessage.content || m.role !== "user"));
    const content = failedMessage.content;
    setFailedMessage(null);
    sendMessage(content);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function clearChat() {
    setMessages([]);
    setFailedMessage(null);
    showToast("info", "Chat cleared", "Started a new conversation.");
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">AI Copilot</h1>
          <p className="text-sm text-muted mt-1">Ask questions about your revenue, customers, and inventory.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-3.5 w-3.5" /> Clear chat
          </Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col min-h-[520px] p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">How can I help today?</h2>
              <p className="text-sm text-muted mt-1 mb-6 max-w-sm">
                I can help you understand your revenue, customers, and inventory. Try one of these to get started.
              </p>
              <div className="w-full max-w-lg">
                <SuggestedPrompts onSelect={sendMessage} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && <TypingIndicator />}
              {failedMessage && !isThinking && (
                <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-error shrink-0" />
                  <p className="text-xs text-foreground/80 flex-1">{failedMessage.error}</p>
                  <Button variant="outline" size="sm" onClick={retryLastMessage}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/5 p-3 sm:p-4 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, customers, or inventory..."
            className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isThinking} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </motion.form>
      </Card>
    </div>
  );
}