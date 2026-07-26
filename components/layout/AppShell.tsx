"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: ReactNode;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
  "/invoices": "Invoices",
  "/reports": "Reports",
  "/copilot": "AI Copilot",
  "/settings": "Settings",
};

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title =
    pageTitles[pathname ?? ""] ??
    (pathname?.startsWith("/invoices/") ? "Invoice Preview" : pathname?.startsWith("/orders/") ? "Orders" : "Dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
