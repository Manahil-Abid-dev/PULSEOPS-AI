"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Zap,
  X,
  ShoppingCart,
  Receipt,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/services/authService";
import { useToast } from "@/components/providers/ToastProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "AI Copilot", href: "/copilot", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleLogout() {
    try {
      await logout();
      showToast("info", "Signed out", "You've been logged out.");
      router.push("/login");
    } catch {
      showToast("error", "Couldn't sign out", "Please try again.");
    }
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 h-16 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">PulseOps AI</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "text-white bg-gradient-to-r from-primary/90 to-secondary/80 shadow-lg shadow-primary/20"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:text-error hover:bg-error/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-background/60 backdrop-blur-xl print:hidden">
        {content}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 print:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0b0f1a] border-r border-white/10 shadow-2xl animate-in-left">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
