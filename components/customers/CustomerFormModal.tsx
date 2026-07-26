"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Building2, Mail, Phone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Customer, CustomerFormValues } from "@/types/customer";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  company: z.string().trim().min(1, "Company is required"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[\d+\-\s()]+$/, "Enter a valid phone number"),
  status: z.enum(["active", "inactive", "pending"]),
});

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  customer?: Customer | null;
}

const defaultValues: CustomerFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "active",
};

export function CustomerFormModal({ open, onClose, onSubmit, customer }: CustomerFormModalProps) {
  const isEditing = Boolean(customer);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              company: customer.company,
              email: customer.email,
              phone: customer.phone,
              status: customer.status,
            }
          : defaultValues
      );
    }
  }, [open, customer, reset]);

  async function submit(values: CustomerFormValues) {
    await onSubmit(values);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Customer" : "Add Customer"}
      description={isEditing ? "Update this customer's profile." : "Add a new customer to your CRM."}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="Jordan Blake"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Company"
          placeholder="Acme Corp"
          icon={<Building2 className="h-4 w-4" />}
          error={errors.company?.message}
          {...register("company")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="jordan@acme.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
