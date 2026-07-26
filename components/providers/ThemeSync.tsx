"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { subscribeToUserSettings } from "@/services/userSettingsService";

export function ThemeSync() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserSettings(
      user.uid,
      (settings) => setTheme(settings.theme),
      () => {}
    );
    return unsubscribe;
  }, [user, setTheme]);

  return null;
}
