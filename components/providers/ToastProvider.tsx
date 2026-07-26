"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ToastViewport, type ToastItem, type ToastVariant } from "@/components/ui/Toast";

interface ToastContextValue {
  showToast: (variant: ToastVariant, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = `toast-${Date.now()}-${idCounter++}`;
      setToasts((prev) => [...prev, { id, variant, title, description }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
