"use client";

import { Database, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useFirebaseStatus } from "@/hooks/useFirebaseStatus";

export function FirebaseStatusSection() {
  const { status, projectId } = useFirebaseStatus();

  const statusConfig = {
    checking: { icon: Loader2, label: "Checking...", variant: "neutral" as const, spin: true },
    online: { icon: Wifi, label: "Connected", variant: "success" as const, spin: false },
    offline: { icon: WifiOff, label: "Offline", variant: "warning" as const, spin: false },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" /> Firebase Connection
        </CardTitle>
        <Badge variant={statusConfig.variant} className="capitalize">
          <Icon className={`h-3 w-3 ${statusConfig.spin ? "animate-spin" : ""}`} />
          {statusConfig.label}
        </Badge>
      </CardHeader>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Project ID</span>
          <span className="text-foreground/90 font-mono text-xs">{projectId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Services</span>
          <span className="text-foreground/90">Auth, Firestore</span>
        </div>
      </div>
      <p className="text-xs text-muted mt-4 leading-relaxed">
        Customers, products, and your settings are synced live with Firestore. If you go offline, changes are
        cached locally and sync automatically once you&apos;re back online.
      </p>
    </Card>
  );
}
