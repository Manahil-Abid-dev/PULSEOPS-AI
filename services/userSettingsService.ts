import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DEFAULT_USER_SETTINGS,
  type AIPreferences,
  type NotificationPreferences,
  type ThemePreference,
  type UserProfile,
  type UserSettings,
} from "@/types/settings";

const COLLECTION = "users";

/** Deep-merges Firestore data over the defaults so missing fields never crash the UI. */
function mergeWithDefaults(data: Partial<UserSettings> | undefined): UserSettings {
  return {
    profile: { ...DEFAULT_USER_SETTINGS.profile, ...data?.profile },
    aiPreferences: { ...DEFAULT_USER_SETTINGS.aiPreferences, ...data?.aiPreferences },
    notificationPreferences: {
      ...DEFAULT_USER_SETTINGS.notificationPreferences,
      ...data?.notificationPreferences,
    },
    theme: data?.theme ?? DEFAULT_USER_SETTINGS.theme,
  };
}

/** Subscribes to a user's settings document in real time. Returns an unsubscribe function. */
export function subscribeToUserSettings(
  uid: string,
  onData: (settings: UserSettings) => void,
  onError: (message: string) => void
) {
  return onSnapshot(
    doc(db, COLLECTION, uid),
    (snapshot) => {
      onData(mergeWithDefaults(snapshot.data() as Partial<UserSettings> | undefined));
    },
    (err) => {
      onError(err.message || "Failed to load your settings from Firebase.");
    }
  );
}

/** Creates the initial settings document for a brand-new user (called right after signup). */
export async function createUserSettingsDocument(
  uid: string,
  initialProfile: Partial<UserProfile>
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, uid),
    {
      ...DEFAULT_USER_SETTINGS,
      profile: { ...DEFAULT_USER_SETTINGS.profile, ...initialProfile },
    },
    { merge: true }
  );
}

export async function updateUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), { profile }, { merge: true });
}

export async function updateAIPreferences(uid: string, aiPreferences: AIPreferences): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), { aiPreferences }, { merge: true });
}

export async function updateNotificationPreferences(
  uid: string,
  notificationPreferences: NotificationPreferences
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), { notificationPreferences }, { merge: true });
}

export async function updateThemePreference(uid: string, theme: ThemePreference): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), { theme }, { merge: true });
}
