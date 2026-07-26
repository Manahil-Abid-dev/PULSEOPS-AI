"use client";

import { Building2, Mail, Phone, Calendar, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Customer, CustomerStatus } from "@/types/customer";

const statusVariant: Record<CustomerStatus, "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
};

interface CustomerDetailsModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit: () => void;
}

export function CustomerDetailsModal({ open, onClose, customer, onEdit }: CustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <Modal open={open} onClose={onClose} title="Customer Details">
      <div className="flex items-center gap-3 -mt-1 mb-5">
        <Avatar name={customer.name} size="lg" />
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{customer.name}</p>
          <Badge variant={statusVariant[customer.status]} className="mt-1 capitalize">
            {customer.status}
          </Badge>
        </div>
      </div>

      <dl className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Company</dt>
          <dd className="text-foreground/90">{customer.company}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Email</dt>
          <dd className="text-foreground/90 break-all">{customer.email}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Phone</dt>
          <dd className="text-foreground/90">{customer.phone}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Created</dt>
          <dd className="text-foreground/90">
            {new Date(customer.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-3 pt-6">
        <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button size="md" className="flex-1" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </div>
    </Modal>
  );
}
