import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AutomationControlPanel } from "@/components/dashboard/AutomationControlPanel";

export const metadata: Metadata = {
  title: "Dashboard | PulseOps AI",
};

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Overview */}
      <DashboardView />

      {/* ⚡ Automation Control Panel */}
      <AutomationControlPanel />
    </div>
  );
}
