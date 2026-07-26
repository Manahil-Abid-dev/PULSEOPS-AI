"use client";

import { useEffect, useState } from "react";
import { subscribeToProducts } from "@/services/productService";
import type { Product } from "@/types/product";

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Subscribes to the products collection in real time, so the dashboard's
 * product count and any other consumer stays in sync automatically.
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
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

  return { products, isLoading, error };
}
