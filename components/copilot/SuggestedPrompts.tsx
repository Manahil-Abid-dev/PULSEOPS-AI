"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Package, FileBarChart } from "lucide-react";
import type { SuggestedPrompt } from "@/types/chat";

export const suggestedPrompts: SuggestedPrompt[] = [
  {
    id: "sp1",
    label: "Analyze revenue trend",
    prompt: "How is my revenue trending this month?",
  },
  {
    id: "sp2",
    label: "Customer insights",
    prompt: "What can you tell me about my customers?",
  },
  {
    id: "sp3",
    label: "Inventory check",
    prompt: "Which products are running low on stock?",
  },
  {
    id: "sp4",
    label: "Weekly summary",
    prompt: "Give me a summary of my business performance.",
  },
];

const iconMap = [TrendingUp, Users, Package, FileBarChart];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {suggestedPrompts.map((item, index) => {
        const Icon = iconMap[index % iconMap.length];
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelect(item.prompt)}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-2">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground/90">{item.label}</p>
            <p className="text-xs text-muted mt-0.5 line-clamp-2">{item.prompt}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
