import type { Metadata } from "next";
import { ReportsView } from "@/components/reports/ReportsView";

export const metadata: Metadata = {
  title: "Reports | PulseOps AI",
};

export default function ReportsPage() {
  return <ReportsView />;
}
