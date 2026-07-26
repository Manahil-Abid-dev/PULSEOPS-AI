import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserSettingsDocument } from "@/services/userSettingsService";

/** Maps raw Firebase error codes to friendly, actionable messages. */
function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/requires-recent-login":
      return "For security, please log out and back in before changing your password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<User> {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    throw new Error(friendlyAuthError(code));
  }
}

/** Creates a new account, sets the display name, and seeds their Firestore settings document. */
export async function signupWithEmail(name: string, email: string, password: string): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await createUserSettingsDocument(credential.user.uid, { name });
    return credential.user;
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    throw new Error(friendlyAuthError(code));
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    throw new Error(friendlyAuthError(code));
  }
}

/** Changes the signed-in user's password, reauthenticating with their current password first. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("You need to be signed in to change your password.");
  }
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    throw new Error(friendlyAuthError(code));
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
