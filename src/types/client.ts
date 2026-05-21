import type { DivisionId } from "../constants/divisions";

export interface License {
  type: string;
  number: string;
  expiryDate: string;
  file?: File | null;
  documentUrl?: string;
}

export interface Client {
  id: string; // This is the client_code (SER-001, etc.)
  name: string; // Contact Person
  company: string; // Company Name
  email: string;
  phone: string;
  division: DivisionId;
  address: string;
  qid: string;
  crNumber: string;
  computerCard: string;
  licenses: License[];
  contractType: string;
  startDate: string;
  renewalDate: string;
  // Support for both casing styles (legacy/DataTable compatibility)
  Name?: string;
  Company?: string;
  Email?: string;
  Phone?: string;
  
  agreementTitle?: string;
  agreementUrl?: string;
  createdAt: string;
  userId?: string | number;
  companyName?: string;
}
