"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="" className="max-w-sm">
      <div className="text-center -mt-2">
        <div className="h-12 w-12 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted mt-2 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" size="md" className="flex-1" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="danger" size="md" className="flex-1" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Deleting..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
