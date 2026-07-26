"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <Avatar name="You" size="sm" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-sm"
            : "glass-card text-foreground/90 rounded-tl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn("text-[10px] mt-1.5", isUser ? "text-white/70" : "text-muted")}>
          {new Date(message.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}
