import type { DivisionId } from "../constants/divisions";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "submitted" | "due";

export type ApprovalType = "invoice" | "quotation" | "expense" | "credit";

export interface ApprovalRecord {
  id: string;
  type: ApprovalType;
  itemId: string; // ID of the invoice, quotation, etc.
  itemNumber: string; // The human-readable number (e.g. INV-1001)
  division: DivisionId | "all";
  status: ApprovalStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  notes?: string;
  amount?: number;
}
