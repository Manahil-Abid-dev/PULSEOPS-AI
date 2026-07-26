"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { AIPreferencesSection } from "@/components/settings/AIPreferencesSection";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { FirebaseStatusSection } from "@/components/settings/FirebaseStatusSection";
import { AboutSection } from "@/components/settings/AboutSection";

export function SettingsView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings, isLoading: isSettingsLoading, error } = useUserSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your profile, preferences, and account security.</p>
      </div>

      {isAuthLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : !user ? (
        <Card className="flex flex-col items-center text-center py-14">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Sign in to manage your settings</p>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Your profile, preferences, and security settings are tied to your account.
          </p>
          <Link href="/login">
            <Button size="md" className="mt-5">
              Sign in
            </Button>
          </Link>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {isSettingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <ProfileSection user={user} profile={settings.profile} />
              <AIPreferencesSection uid={user.uid} preferences={settings.aiPreferences} />
              <NotificationPreferencesSection uid={user.uid} preferences={settings.notificationPreferences} />
              <AppearanceSection uid={user.uid} />
              <SecuritySection email={user.email} />
              <FirebaseStatusSection />
              <AboutSection />
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
