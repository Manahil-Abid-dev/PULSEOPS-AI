import type { Metadata } from "next";
import { InvoicesView } from "@/components/invoices/InvoicesView";

export const metadata: Metadata = {
  title: "Invoices | PulseOps AI",
};

export default function InvoicesPage() {
  return <InvoicesView />;
}
