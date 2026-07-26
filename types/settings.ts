export interface UserProfile {
  name: string;
  company: string;
  phone: string;
}

export type AIResponseTone = "concise" | "detailed" | "friendly";

export interface AIPreferences {
  enableSuggestions: boolean;
  enableAutoInsights: boolean;
  responseTone: AIResponseTone;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
}

export type ThemePreference = "dark" | "light";

export interface UserSettings {
  profile: UserProfile;
  aiPreferences: AIPreferences;
  notificationPreferences: NotificationPreferences;
  theme: ThemePreference;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    name: "",
    company: "",
    phone: "",
  },
  aiPreferences: {
    enableSuggestions: true,
    enableAutoInsights: true,
    responseTone: "concise",
  },
  notificationPreferences: {
    emailNotifications: true,
    lowStockAlerts: true,
    weeklySummary: false,
    productUpdates: true,
  },
  theme: "dark",
};
