import { NextRequest, NextResponse } from "next/server";
import { requireAutomationKey } from "@/lib/automation-auth";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";

/**
 * "System Data Sync" — forces a fresh read of products/orders/invoices/
 * customers past the 30s snapshot cache (see lib/businessSnapshot.ts),
 * so the dashboard's real-time views reflect the latest data immediately
 * instead of waiting out the cache TTL.
 */
export async function GET(req: NextRequest) {
  const unauthorized = requireAutomationKey(req);
  if (unauthorized) return unauthorized;

  try {
    const snapshot = await getBusinessSnapshot({ forceRefresh: true });
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      counts: {
        products: snapshot.products.length,
        orders: snapshot.orders.length,
        invoices: snapshot.invoices.length,
        customers: snapshot.customers.length,
      },
    });
  } catch (error: any) {
    console.error("[automation/sync] failed:", error);
    return NextResponse.json({ error: error?.message ?? "Internal error" }, { status: 500 });
  }
}