import type { DivisionId } from "../constants/divisions";
import type { ApprovalStatus } from "./approvals";

export interface QuotationItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  image?: string;
  customSrNo?: string;
}

export interface Quotation {
  id: string;
  "Quote ID"?: string; // Legacy
  refNo: string;
  division: DivisionId;
  branch?: string; // Legacy
  project?: string;
  client?: string;
  date?: string;
  qtn_number?: string;
  total_amount?: number;
  Status: string;
  status?: string; // Compatibility
  items: QuotationItem[];
  aboutUs?: string;
  whatWeDo?: string;
  proposalIntro?: string;
  financialTerms?: string;
  clientDuties?: string;
  paymentTerms?: string;
  scopeOfWork?: string;
  qty?: number;
  createdAt?: string;
  created_at?: string; // Added for compatibility
  totalAmount?: number;
  approvalStatus?: ApprovalStatus;

  // Added for details view compatibility
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  attn?: string;
  attn_designation?: string;
  project_name?: string;
  reference_no?: string;
  reference_number?: string;
  salutation?: string;
  intro_text?: string;
  outro_text?: string;
  tc_terms?: string;
  tc_payment?: string;
  tc_delivery?: string;
  tc_installation?: string;
  tc_validity?: string;
  selected_format?: string;
  salesman?: string;
  salesman_designation?: string;
  salesman_phone?: string;
  salesman_email?: string;
  netTotal?: number; // Added for compatibility
}

export interface BOQItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BOQ {
  id: string;
  ID?: string; // Legacy
  project: string;
  client: string;
  date: string;
  Status: string;
  totalAmount: number | string;
  items: BOQItem[];
}
export interface ProposalActivity {
  id: string;
  title: string;
  description: string;
}

export interface Proposal {
  id: string;
  proposalNo: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Declined";
  isTemplate?: boolean;
  
  // Cover Page
  preparedFor: string;
  clientName: string;
  year: string;
  title: string;

  // About Company
  aboutCompany: string;

  // Services
  services: string[];

  // Our Proposal
  proposalDescription: string;

  // Activities
  activities: ProposalActivity[];

  // Financial
  packageName: string;
  totalPackageCost: number;
  includedServices: string;
  exclusions: string;
  financialNotes: string;

  // Additional Terms
  clientDuties: string;
  paymentTerms: string;

  // Compatibility fields
  amount?: number;
  client?: string;
  date?: string;
}
