"use client";

import { useEffect, useState } from "react";
import { subscribeToCustomers } from "@/services/customerService";
import type { Customer } from "@/types/customer";

interface UseCustomersResult {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Subscribes to the customers collection in real time. Any add/edit/delete
 * elsewhere in the app (or by another user) is reflected immediately,
 * which is what keeps the dashboard's customer count live.
 */
export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCustomers(
      (data) => {
        setCustomers(data);
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

  return { customers, isLoading, error };
}
