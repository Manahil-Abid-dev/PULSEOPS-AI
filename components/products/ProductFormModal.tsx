"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, DollarSign, Boxes } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product, ProductFormValues } from "@/types/product";

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  category: z.enum(PRODUCT_CATEGORIES as [string, ...string[]]),
  price: z.coerce.number().nonnegative("Price can't be negative"),
  quantity: z.coerce.number().int("Quantity must be a whole number").nonnegative("Quantity can't be negative"),
});

const categoryOptions = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }));

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  product?: Product | null;
}

type FormInput = z.input<typeof productSchema>;
type FormOutput = z.output<typeof productSchema>;

const defaultValues: FormInput = {
  name: "",
  category: "Apparel",
  price: 0,
  quantity: 0,
};

export function ProductFormModal({ open, onClose, onSubmit, product }: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? { name: product.name, category: product.category, price: product.price, quantity: product.quantity }
          : defaultValues
      );
    }
  }, [open, product, reset]);

  async function submit(values: FormOutput) {
    await onSubmit({ ...values, category: values.category as ProductFormValues["category"], status: "in-stock" });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add Product"}
      description={isEditing ? "Update this product's details." : "Add a new product to your catalog."}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Product name"
          placeholder="Wireless Mouse Pro"
          icon={<Package className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Select label="Category" options={categoryOptions} error={errors.category?.message} {...register("category")} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="29.99"
            icon={<DollarSign className="h-4 w-4" />}
            error={errors.price?.message}
            {...register("price")}
          />
          <Input
            label="Quantity"
            type="number"
            min="0"
            placeholder="120"
            icon={<Boxes className="h-4 w-4" />}
            error={errors.quantity?.message}
            {...register("quantity")}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
