import type { Metadata } from "next";
import { CopilotView } from "@/components/copilot/CopilotView";

export const metadata: Metadata = {
  title: "AI Copilot | PulseOps AI",
};

export default function CopilotPage() {
  return <CopilotView />;
}
