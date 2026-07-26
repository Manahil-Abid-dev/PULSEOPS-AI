"use client";

import { useEffect, useState } from "react";
import { subscribeToInvoices } from "@/services/invoiceService";
import type { Invoice } from "@/types/invoice";

interface UseInvoicesResult {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
}

/** Subscribes to the invoices collection in real time. */
export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToInvoices(
      (data) => {
        setInvoices(data);
        setIsLoading(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { invoices, isLoading, error };
}
