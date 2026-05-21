import type { DivisionId } from "../constants/divisions";

export type QuotationStatus = "Pending" | "Approved" | "Declined" | "Draft";

export interface Quotation {
  id: string;
  proposalNo: string;
  title: string;
  client: string;
  clientName?: string; // Compatibility
  amount: number;
  date: string;
  status: QuotationStatus;
  branch?: string; // Legacy/Multi-division
  division?: DivisionId;
  validity?: string;
  notes?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface Proposal extends Quotation {
  // Can add specific fields for proposals if different from quotations
  expiryDate?: string;
  terms?: string;
}
