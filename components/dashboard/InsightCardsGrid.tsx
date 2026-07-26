"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import type { InsightCardData } from "@/types/dashboard";

interface InsightCardsGridProps {
  cards: InsightCardData[];
}

export function InsightCardsGrid({ cards }: InsightCardsGridProps) {
  if (!cards.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
        >
          <Card className="h-full p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted font-medium">{card.label}</p>
            <p className="text-sm font-semibold text-foreground mt-1.5 truncate" title={card.value}>
              {card.value}
            </p>
            {card.hint && <p className="text-xs text-muted mt-0.5">{card.hint}</p>}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
