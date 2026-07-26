export type CustomerStatus = "active" | "inactive" | "pending";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  createdAt: string; // ISO date string
}

/** Fields collected from the Add/Edit Customer form. */
export type CustomerFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
};

export type CustomerSortField = "name" | "company" | "createdAt" | "status";
export type SortDirection = "asc" | "desc";
