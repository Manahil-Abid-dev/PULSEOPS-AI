"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, ShieldCheck, Mail, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { changePassword, requestPasswordReset, logout } from "@/services/authService";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Enter your current password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

interface SecuritySectionProps {
  email: string | null;
}

export function SecuritySection({ email }: SecuritySectionProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      showToast("success", "Password updated", "Your password has been changed successfully.");
      reset();
    } catch (err) {
      showToast("error", "Couldn't change password", err instanceof Error ? err.message : "Please try again.");
    }
  }

  async function handleSendReset() {
    if (!email) {
      showToast("error", "No email on file", "Sign in with an email account to reset your password.");
      return;
    }
    setIsSendingReset(true);
    try {
      await requestPasswordReset(email);
      showToast("success", "Reset link sent", `Check ${email} for password reset instructions.`);
    } catch (err) {
      showToast("error", "Couldn't send reset link", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast("info", "Signed out", "You've been logged out.");
      router.push("/login");
    } catch {
      showToast("error", "Couldn't sign out", "Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Security
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Current password"
          type={showCurrent ? "text" : "password"}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.currentPassword?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              className="h-6 w-6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("currentPassword")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="New password"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.newPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="h-6 w-6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("newPassword")}
          />
          <Input
            label="Confirm new password"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="md" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>

      <div className="h-px bg-white/5 my-5" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-foreground/90">Forgot your password?</p>
          <p className="text-xs text-muted mt-0.5">We&apos;ll email a reset link to {email ?? "your account email"}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSendReset} disabled={isSendingReset}>
          <Mail className="h-3.5 w-3.5" /> {isSendingReset ? "Sending..." : "Send reset email"}
        </Button>
      </div>

      <div className="h-px bg-white/5 my-5" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-foreground/90">Sign out</p>
          <p className="text-xs text-muted mt-0.5">End your session on this device.</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="h-3.5 w-3.5" /> {isLoggingOut ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </Card>
  );
}
