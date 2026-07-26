"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Percent, Tag, CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { INVOICE_STATUSES } from "@/types/invoice";
import type { Invoice, InvoiceFormValues } from "@/types/invoice";
import type { Order } from "@/types/order";

const invoiceSchema = z.object({
  orderId: z.string().min(1, "Select an order"),
  taxRate: z.coerce.number().min(0, "Tax rate can't be negative").max(100, "Tax rate can't exceed 100%"),
  discount: z.coerce.number().min(0, "Discount can't be negative"),
  status: z.enum(INVOICE_STATUSES as [string, ...string[]]),
  dueDate: z.string().min(1, "Select a due date"),
});

type FormInput = z.input<typeof invoiceSchema>;
type FormOutput = z.output<typeof invoiceSchema>;

const statusOptions = INVOICE_STATUSES.map((s) => ({ value: s, label: s }));

function toDateInputValue(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  invoice?: Invoice | null;
  eligibleOrders: Order[];
}

export function InvoiceFormModal({ open, onClose, onSubmit, invoice, eligibleOrders }: InvoiceFormModalProps) {
  const isEditing = Boolean(invoice);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { orderId: "", taxRate: 0, discount: 0, status: "Draft", dueDate: defaultDueDate() },
  });

  useEffect(() => {
    if (open) {
      reset(
        invoice
          ? {
              orderId: invoice.orderId,
              taxRate: invoice.taxRate,
              discount: invoice.discount,
              status: invoice.status,
              dueDate: toDateInputValue(invoice.dueDate),
            }
          : { orderId: "", taxRate: 0, discount: 0, status: "Draft", dueDate: defaultDueDate() }
      );
    }
  }, [open, invoice, reset]);

  const orderOptions = eligibleOrders.map((o) => ({
    value: o.id,
    label: `${o.orderNumber} — ${o.customerName} (${formatCurrency(o.total)})`,
  }));

  const watchedOrderId = useWatch({ control, name: "orderId" });
  const watchedTaxRate = useWatch({ control, name: "taxRate" });
  const watchedDiscount = useWatch({ control, name: "discount" });

  const selectedOrder = useMemo(
    () => eligibleOrders.find((o) => o.id === watchedOrderId) ?? (invoice ? { subtotal: invoice.subtotal } : null),
    [eligibleOrders, watchedOrderId, invoice]
  );

  const subtotal = selectedOrder?.subtotal ?? 0;
  const discount = Math.min(Math.max(Number(watchedDiscount) || 0, 0), subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const taxAmount = taxable * (Math.max(Number(watchedTaxRate) || 0, 0) / 100);
  const grandTotal = taxable + taxAmount;

  async function submit(values: FormOutput) {
    await onSubmit({ ...values, status: values.status as InvoiceFormValues["status"] });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Invoice" : "Generate Invoice"}
      description={
        isEditing
          ? "Update this invoice's billing details."
          : "Pick an order — its customer and items carry over automatically."
      }
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {isEditing ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-muted">Source order</p>
            <p className="text-sm text-foreground/90 font-medium mt-0.5">
              {invoice?.orderNumber} — {invoice?.customerName}
            </p>
          </div>
        ) : (
          <Select
            label="Order"
            options={[{ value: "", label: "Select an order" }, ...orderOptions]}
            error={errors.orderId?.message}
            disabled={eligibleOrders.length === 0}
            {...register("orderId")}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tax rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="8.5"
            icon={<Percent className="h-4 w-4" />}
            error={errors.taxRate?.message}
            {...register("taxRate")}
          />
          <Input
            label="Discount (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            icon={<Tag className="h-4 w-4" />}
            error={errors.discount?.message}
            {...register("discount")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due date"
            type="date"
            icon={<CalendarClock className="h-4 w-4" />}
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
          <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Tax</span>
            <span>+{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-1.5 border-t border-white/10">
            <span>Grand total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="md"
            className="flex-1"
            disabled={isSubmitting || (!isEditing && eligibleOrders.length === 0)}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Generate invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
