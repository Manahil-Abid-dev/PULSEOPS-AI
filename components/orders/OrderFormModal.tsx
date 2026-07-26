"use client";

import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types/order";
import type { Order, OrderFormValues } from "@/types/order";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int("Whole numbers only").positive("Quantity must be at least 1"),
});

const orderSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  items: z.array(orderItemSchema).min(1, "Add at least one product"),
});

type FormInput = z.input<typeof orderSchema>;
type FormOutput = z.output<typeof orderSchema>;

const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: s }));

const emptyItem = { productId: "", quantity: 1 };

const defaultValues: FormInput = {
  customerId: "",
  status: "Pending",
  items: [emptyItem],
};

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  order?: Order | null;
  customers: Customer[];
  products: Product[];
}

export function OrderFormModal({ open, onClose, onSubmit, order, customers, products }: OrderFormModalProps) {
  const isEditing = Boolean(order);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  useEffect(() => {
    if (open) {
      reset(
        order
          ? {
              customerId: order.customerId,
              status: order.status,
              items: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
            }
          : defaultValues
      );
    }
  }, [open, order, reset]);

  const customerOptions = customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.company}` }));
  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.quantity} in stock)`,
  }));

  const subtotal = (watchedItems ?? []).reduce((sum, item) => {
    const product = products.find((p) => p.id === item?.productId);
    const quantity = Number(item?.quantity) || 0;
    return sum + quantity * (product?.price ?? 0);
  }, 0);

  async function submit(values: FormOutput) {
    await onSubmit({ ...values, status: values.status as OrderFormValues["status"] });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Order" : "Add Order"}
      description={isEditing ? "Update this order's items and status." : "Create a new order for a customer."}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Customer"
            options={[{ value: "", label: "Select a customer" }, ...customerOptions]}
            error={errors.customerId?.message}
            {...register("customerId")}
          />
          <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted block">Products</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyItem)}
              disabled={products.length === 0}
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          </div>

          {products.length === 0 ? (
            <p className="text-xs text-muted">Add a product to your catalog before creating orders.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedId = watchedItems?.[index]?.productId;
                const product = products.find((p) => p.id === selectedId);
                return (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Select
                        options={[{ value: "", label: "Select a product" }, ...productOptions]}
                        error={errors.items?.[index]?.productId?.message}
                        {...register(`items.${index}.productId` as const)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        error={errors.items?.[index]?.quantity?.message}
                        {...register(`items.${index}.quantity` as const)}
                      />
                    </div>
                    <div className="w-24 h-10 flex items-center justify-end text-xs text-foreground/70 shrink-0">
                      {product ? formatCurrency(product.price * (Number(watchedItems?.[index]?.quantity) || 0)) : "—"}
                    </div>
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      className="h-10 w-9 flex items-center justify-center rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {errors.items?.message && <p className="text-xs text-error mt-1.5">{errors.items.message}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-muted">Order total</span>
          <span className="text-base font-semibold text-foreground">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md" className="flex-1" disabled={isSubmitting || products.length === 0}>
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
