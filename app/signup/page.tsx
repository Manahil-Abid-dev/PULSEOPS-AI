"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { signupWithEmail } from "@/services/authService";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreeToTerms: false },
  });

  async function onSubmit(values: SignupFormValues) {
    setFormError(null);
    try {
      await signupWithEmail(values.name, values.email, values.password);
      showToast("success", "Account created", "Welcome to PulseOps AI!");
      router.push("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-lg text-foreground tracking-tight">PulseOps AI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20"
        >
          <h1 className="text-lg font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted mt-1 mb-6">Start managing your operations with PulseOps AI.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              placeholder="Jordan Blake"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
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
              {...register("password")}
            />

            <Input
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="h-6 w-6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("confirmPassword")}
            />

            <div>
              <label className="flex items-start gap-2 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 mt-0.5 rounded border-white/20 bg-white/5 accent-primary"
                  {...register("agreeToTerms")}
                />
                <span>
                  I agree to the{" "}
                  <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and{" "}
                  <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-xs text-error mt-1.5">{errors.agreeToTerms.message}</p>}
            </div>

            {formError && (
              <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" size="md" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </motion.div>

        <p className="text-xs text-muted text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
