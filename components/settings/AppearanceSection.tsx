"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { updateThemePreference } from "@/services/userSettingsService";

interface AppearanceSectionProps {
  uid: string | null;
}

const options: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", description: "The default premium dark theme.", icon: Moon },
  { value: "light", label: "Light", description: "A brighter theme for daytime use.", icon: Sun },
];

export function AppearanceSection({ uid }: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSelect(next: Theme) {
    setTheme(next);
    if (!uid) return;
    setIsSaving(true);
    try {
      await updateThemePreference(uid, next);
    } catch {
      showToast("error", "Couldn't sync theme", "Your theme changed locally but couldn't be saved to your account.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={isSaving}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 disabled:opacity-60",
                active
                  ? "border-primary/40 bg-primary/10 shadow-md shadow-primary/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                  active ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-white/5 text-muted"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/90">{option.label}</p>
                <p className="text-xs text-muted mt-0.5">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
