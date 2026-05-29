import type { DivisionId } from "../constants/divisions";

export type InvoiceStatus = "Paid" | "Unpaid" | "Partial" | "Overdue" | "Due";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  code?: string;
  discount?: number;
  uom?: string; // Added for compatibility
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  customerCode?: string;
  clientId?: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  amount: number;
  total?: number; // Aliased for compatibility
  taxRate: number;
  taxAmount: number;
  discount: number;
  amount_paid?: number;
  advance?: number;
  advancePaid?: number;
  balance?: number;
  items: InvoiceItem[];
  division: DivisionId;
  branch?: string; // Legacy
  notes?: string;
  creditTerms?: number;
  refType?: string;
  refNo?: string;
  paymentTerms?: string;
  lpoNo?: string;
  salesman?: string;
  qid?: string;
  address?: string;
  invoiceType?: "Credit" | "Cash";
  due_date?: string; // Added
  invoice_date?: string; // Added
  attn?: string; // Added
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
  project?: string;
  projectName?: string; // Added for compatibility
  tel?: string;
  contactNumber?: string;
  deliveryNote?: string;
  delivery_note?: string; // Added for compatibility
  dnDate?: string;
  dn_date?: string; // Added for compatibility
  dnPreparedBy?: string;
  dn_prepared_by?: string; // Added for compatibility
  dnCheckedBy?: string;
  dn_checked_by?: string; // Added for compatibility
  dnReceiverName?: string;
  dn_receiver_name?: string; // Added for compatibility
  totals?: {
    subtotal: number;
    tax: number;
    total: number;
    balance: number;
  };
  paymentHistory?: {
    id: string;
    amount: number;
    method: string;
    date: string;
    notes: string;
  }[];
}

export interface Expense {
  id: string;
  expenseName: string;
  category: string;
  division: DivisionId;
  branch?: string; // Legacy
  divisionLabel?: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  vendor: string;
  paymentMethod: string;
  date: string;
  status?: string;
  attachment?: string;
  notes?: string;
  allocationType: "SINGLE" | "SMART";
  allocations: {
    contracting: number;
    trading: number;
    service: number;
  };
  referenceId?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
  referenceType?: string;
  description?: string;
}

export interface BillingSummary {
  total: number;
  paid: number;
  pending: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  client: string;
  amount: number;
  date: string;
  method: "Cash" | "Cheque" | "Bank Transfer";
  reference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface AccountsStats {
  receivables: number;
  payables: number;
  pendingPayments: number;
  profitMargin: string | number;
}

export interface FinancialTrendData {
  month: string;
  receivables: number;
  payables: number;
}

export interface AccountsDashboardData {
  stats: AccountsStats;
  financialData: FinancialTrendData[];
  recentInvoices: Invoice[];
}
