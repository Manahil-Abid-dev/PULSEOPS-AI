"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: "text-success border-success/25" },
  error: { icon: XCircle, classes: "text-error border-error/25" },
  info: { icon: Info, classes: "text-primary border-primary/25" },
};

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, classes } = variantConfig[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "glass-card rounded-xl shadow-xl shadow-black/30 p-4 flex items-start gap-3 border",
                classes
              )}
              role="status"
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-muted hover:text-foreground transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
