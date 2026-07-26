"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Building2, Phone, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { updateUserProfile } from "@/services/userSettingsService";
import type { UserProfile } from "@/types/settings";
import type { User as FirebaseUser } from "firebase/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  company: z.string().trim().max(120, "Keep this under 120 characters").optional().default(""),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .default("")
    .refine((v) => v === "" || /^[\d+\-\s()]{7,}$/.test(v), "Enter a valid phone number"),
});

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.output<typeof profileSchema>;

interface ProfileSectionProps {
  user: FirebaseUser;
  profile: UserProfile;
}

export function ProfileSection({ user, profile }: ProfileSectionProps) {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  useEffect(() => {
    reset(profile);
  }, [profile, reset]);

  async function onSubmit(values: ProfileFormOutput) {
    try {
      await updateUserProfile(user.uid, values);
      showToast("success", "Profile updated", "Your profile has been saved.");
      reset(values);
    } catch {
      showToast("error", "Couldn't save profile", "Please try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full name"
            placeholder="Jordan Blake"
            icon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />
          <Input label="Email" value={user.email ?? ""} icon={<Mail className="h-4 w-4" />} disabled readOnly />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company"
            placeholder="Acme Corp"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.company?.message}
            {...register("company")}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" size="md" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
