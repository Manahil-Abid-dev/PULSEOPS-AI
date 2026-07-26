"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { loginWithEmail, requestPasswordReset } from "@/services/authService";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const resetSchema = z.object({
  email: z.email("Enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  async function onLogin(values: LoginFormValues) {
    setFormError(null);
    try {
      await loginWithEmail(values.email, values.password, values.rememberMe);
      showToast("success", "Welcome back", "You've signed in successfully.");
      router.push("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  async function onReset(values: ResetFormValues) {
    setFormError(null);
    try {
      await requestPasswordReset(values.email);
      showToast("success", "Reset link sent", `Check ${values.email} for password reset instructions.`);
      setMode("login");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-lg text-foreground tracking-tight">PulseOps AI</span>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20"
        >
          {mode === "login" ? (
            <>
              <h1 className="text-lg font-semibold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted mt-1 mb-6">Sign in to access your dashboard.</p>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" noValidate>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email")}
                />

                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  error={loginForm.formState.errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="h-6 w-6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  {...loginForm.register("password")}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-primary"
                      {...loginForm.register("rememberMe")}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {formError && (
                  <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <Button type="submit" className="w-full" size="md" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
              <h1 className="text-lg font-semibold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted mt-1 mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4" noValidate>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={resetForm.formState.errors.email?.message}
                  {...resetForm.register("email")}
                />

                {formError && (
                  <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <Button type="submit" className="w-full" size="md" disabled={resetForm.formState.isSubmitting}>
                  {resetForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>

        <p className="text-xs text-muted text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-muted text-center mt-2">
          Just exploring?{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            Preview the dashboard
          </Link>{" "}
          without signing in.
        </p>
      </div>
    </main>
  );
}
