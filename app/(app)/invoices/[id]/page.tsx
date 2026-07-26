"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useInvoices } from "@/hooks/useInvoices";
import { formatCurrency } from "@/lib/utils";
import { printCurrentPage } from "@/lib/exportUtils";
import type { InvoiceStatus } from "@/types/invoice";

const statusVariant: Record<InvoiceStatus, "neutral" | "primary" | "success" | "error"> = {
  Draft: "neutral",
  Sent: "primary",
  Paid: "success",
  Overdue: "error",
};

export default function InvoicePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices, isLoading } = useInvoices();

  const invoice = useMemo(() => invoices.find((inv) => inv.id === params.id) ?? null, [invoices, params.id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-lg bg-white/[0.03] animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-semibold text-foreground">Invoice not found</p>
        <p className="text-xs text-muted mt-1">It may have been deleted.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap print:hidden">
        <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={printCurrentPage}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={printCurrentPage}>
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-0 print:bg-white print:text-black max-w-3xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-lg font-semibold text-foreground print:text-black tracking-tight">PulseOps AI</p>
            <p className="text-xs text-muted print:text-black/60 mt-1">Operations &amp; inventory platform</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground print:text-black">{invoice.invoiceNumber}</p>
            <Badge variant={statusVariant[invoice.status]} className="mt-1">
              {invoice.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs text-muted print:text-black/60 mb-1">Billed to</p>
            <p className="text-foreground/90 print:text-black font-medium">{invoice.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted print:text-black/60 mb-1">Source order</p>
            <p className="text-foreground/90 print:text-black font-medium">{invoice.orderNumber}</p>
            <p className="text-xs text-muted print:text-black/60 mt-3 mb-1">Issued</p>
            <p className="text-foreground/90 print:text-black">
              {new Date(invoice.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted print:text-black/60 mt-3 mb-1">Due</p>
            <p className="text-foreground/90 print:text-black">
              {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 print:border-black/10 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 print:border-black/10 bg-white/[0.03] print:bg-black/5">
                <th className="text-left font-medium text-muted print:text-black/60 text-xs px-3 py-2">Product</th>
                <th className="text-right font-medium text-muted print:text-black/60 text-xs px-3 py-2">Qty</th>
                <th className="text-right font-medium text-muted print:text-black/60 text-xs px-3 py-2">Price</th>
                <th className="text-right font-medium text-muted print:text-black/60 text-xs px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={`${item.productId}-${index}`}
                  className="border-b border-white/5 print:border-black/5 last:border-0"
                >
                  <td className="px-3 py-2 text-foreground/90 print:text-black">{item.productName}</td>
                  <td className="px-3 py-2 text-right text-foreground/80 print:text-black">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-foreground/80 print:text-black">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground/90 print:text-black font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex items-center justify-between text-sm text-muted print:text-black/60">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted print:text-black/60">
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted print:text-black/60">
              <span>Tax ({invoice.taxRate}%)</span>
              <span>+{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-foreground print:text-black pt-2 border-t border-white/10 print:border-black/10">
              <span>Grand total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
