"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { updateAIPreferences } from "@/services/userSettingsService";
import type { AIPreferences, AIResponseTone } from "@/types/settings";

const toneOptions: { value: AIResponseTone; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "friendly", label: "Friendly" },
];

interface AIPreferencesSectionProps {
  uid: string;
  preferences: AIPreferences;
}

export function AIPreferencesSection({ uid, preferences }: AIPreferencesSectionProps) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function persist(next: AIPreferences) {
    setIsSaving(true);
    try {
      await updateAIPreferences(uid, next);
    } catch {
      showToast("error", "Couldn't save AI preferences", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Preferences
        </CardTitle>
      </CardHeader>
      <div className="space-y-5">
        <Switch
          id="ai-suggestions"
          label="Copilot suggestions"
          description="Let the AI Copilot proactively suggest suggested prompts and insights."
          checked={preferences.enableSuggestions}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, enableSuggestions: checked })}
        />
        <Switch
          id="ai-auto-insights"
          label="Automatic insights"
          description="Surface AI-generated insights on your dashboard automatically."
          checked={preferences.enableAutoInsights}
          disabled={isSaving}
          onChange={(checked) => persist({ ...preferences, enableAutoInsights: checked })}
        />
        <div className="max-w-xs">
          <Select
            label="Response tone"
            options={toneOptions}
            value={preferences.responseTone}
            disabled={isSaving}
            onChange={(e) => persist({ ...preferences, responseTone: e.target.value as AIResponseTone })}
          />
        </div>
      </div>
    </Card>
  );
}
