"use client";

import { useEffect, useState } from "react";
import { subscribeToOrders } from "@/services/orderService";
import type { Order } from "@/types/order";

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Subscribes to the orders collection in real time, so the dashboard's
 * revenue/sales figures and the products' stock levels stay in sync
 * automatically whenever an order is created, edited, or removed.
 */
export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
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

  return { orders, isLoading, error };
}
