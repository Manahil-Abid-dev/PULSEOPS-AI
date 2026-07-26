"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/providers/ToastProvider";
import { updateNotificationPreferences } from "@/services/userSettingsService";
import type { NotificationPreferences } from "@/types/settings";

interface NotificationPreferencesSectionProps {
  uid: string;
  preferences: NotificationPreferences;
}

export function NotificationPreferencesSection({ uid, preferences }: NotificationPreferencesSectionProps) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function persist(next: NotificationPreferences) {
    setIsSaving(true);
    try {
      await updateNotificationPreferences(uid, next);
    } catch {
      showToast("error", "Couldn't save notification preferences", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Notification Preferences
        </CardTitle>
      </CardHeader>
      <div className="space-y-5">
        <Switch
          id="notif-email"
          label="Email notifications"
          description="Receive important account and order updates by email."
          checked={preferences.emailNotifications}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, emailNotifications: checked })}
        />
        <Switch
          id="notif-low-stock"
          label="Low stock alerts"
          description="Get notified when a product's stock runs low."
          checked={preferences.lowStockAlerts}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, lowStockAlerts: checked })}
        />
        <Switch
          id="notif-weekly-summary"
          label="Weekly summary"
          description="A weekly digest of revenue, customers, and inventory."
          checked={preferences.weeklySummary}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, weeklySummary: checked })}
        />
        <Switch
          id="notif-product-updates"
          label="Product updates"
          description="News about new PulseOps AI features and improvements."
          checked={preferences.productUpdates}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, productUpdates: checked })}
        />
      </div>
    </Card>
  );
}
