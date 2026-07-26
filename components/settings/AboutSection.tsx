import { Info, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const techStack = ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Framer Motion", "Recharts"];

export function AboutSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" /> About
        </CardTitle>
      </CardHeader>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">PulseOps AI</p>
          <p className="text-xs text-muted">Version 1.0.0</p>
        </div>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        An AI-powered operations dashboard that brings your revenue, customers, and inventory into one place,
        with an AI Copilot to help you make sense of it all.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {techStack.map((item) => (
          <Badge key={item} variant="neutral">
            {item}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted">
        Need help? Reach out at{" "}
        <a href="mailto:support@pulseops.ai" className="text-primary hover:underline">
          support@pulseops.ai
        </a>
      </p>
    </Card>
  );
}
