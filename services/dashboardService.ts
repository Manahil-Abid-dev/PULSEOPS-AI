import type { DashboardData } from "@/types/dashboard";
import { mockDashboardData } from "@/data/mockDashboard";
import { requireIdToken } from "@/lib/clientAuth";

/**
 * Fetches the live dashboard payload (real Firestore metrics + AI executive
 * summary) from /api/dashboard.
 *
 * `forceRefresh` bypasses both the server-side data snapshot cache and the
 * cached AI executive summary — use this for an explicit user action like
 * an "Analyze Business" button, not for routine page loads, to avoid
 * unnecessary Gemini calls (task: Performance).
 */
export async function fetchDashboardData(opts: { forceRefresh?: boolean } = {}): Promise<DashboardData> {
  try {
    const token = await requireIdToken();
    const response = await fetch(`/api/dashboard${opts.forceRefresh ? "?refresh=1" : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Couldn't load dashboard data.");
    }

    return (await response.json()) as DashboardData;
  } catch (error) {
    // Falling back to clearly-labeled demo data keeps the dashboard usable
    // (e.g. before the user is signed in, or if the API is briefly down)
    // instead of showing a hard error for what may just be a transient
    // network hiccup. The UI badges ("Demo data") make it clear this
    // isn't live when it happens.
    console.error("[dashboardService] falling back to demo data:", error);
    return mockDashboardData;
  }
}
