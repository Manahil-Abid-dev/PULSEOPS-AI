"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDashboardData } from "@/services/dashboardService";
import type { DashboardData } from "@/types/dashboard";

interface UseDashboardDataResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: (opts?: { forceRefresh?: boolean }) => void;
}

/**
 * Loads the dashboard payload from /api/dashboard, which now computes
 * everything (stats, revenue trend, insight cards, AI executive summary)
 * server-side from real Firestore data — see app/api/dashboard/route.ts.
 *
 * PERFORMANCE NOTE (was): this hook previously called out to four separate
 * client-side Firestore listeners (useCustomers/useProducts/useOrders/
 * useInvoices) *in addition to* the mock data fetch, just to overlay a
 * few live numbers on top of demo data. That meant every dashboard visit
 * opened several extra Firestore reads/listeners on top of the API call.
 * Now that the API route itself is backed by real data (with its own
 * short-TTL server-side cache, see lib/businessSnapshot.ts), that overlay
 * is redundant and has been removed — the client makes exactly one
 * request per dashboard load.
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardData({ forceRefresh })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load dashboard data. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  const refetch = useCallback((opts?: { forceRefresh?: boolean }) => {
    setIsLoading(true);
    setError(null);
    setForceRefresh(Boolean(opts?.forceRefresh));
    setReloadToken((t) => t + 1);
  }, []);

  return { data, isLoading, error, refetch };
}
