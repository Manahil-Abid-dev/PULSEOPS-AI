import type { Metadata } from "next";
import { CustomersView } from "@/components/customers/CustomersView";

export const metadata: Metadata = {
  title: "Customers | PulseOps AI",
};

export default function CustomersPage() {
  return <CustomersView />;
}
