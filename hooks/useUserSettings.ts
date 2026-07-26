"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeToUserSettings } from "@/services/userSettingsService";
import { DEFAULT_USER_SETTINGS, type UserSettings } from "@/types/settings";

interface UseUserSettingsResult {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

export function useUserSettings(): UseUserSettingsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [liveSettings, setLiveSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return undefined;

    const unsubscribe = subscribeToUserSettings(
      user.uid,
      (data) => {
        setLiveSettings(data);
        setError(null);
      },
      (message) => {
        setError(message);
      }
    );
    return unsubscribe;
  }, [user]);

  const settings = user ? liveSettings ?? DEFAULT_USER_SETTINGS : DEFAULT_USER_SETTINGS;
  const isLoading = isAuthLoading || (Boolean(user) && liveSettings === null && !error);

  return { settings, isLoading, error };
}
