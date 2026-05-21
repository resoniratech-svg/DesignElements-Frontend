import type { DivisionId } from "../constants/divisions";

export type LeadStatus = "New" | "Contacted" | "Follow-up" | "Converted" | "Lost" | "Closed" | "Pending";
export type LeadPriority = "Low" | "Medium" | "High";

export interface FollowUp {
  id: string;
  date: string;
  notes: string;
  type: string; // e.g., 'Call', 'Email', 'Meeting'
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  service?: string;
  status: LeadStatus;
  notes?: string;
  source?: string;
  assignedTo?: string;
  priority?: LeadPriority;
  nextFollowUpDate?: string;
  followUps?: FollowUp[];
  createdAt: string;
  updatedAt?: string;
  division?: DivisionId;
}

export interface MarketingStats {
  totalLeads: number;
  followedUpLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  monthlyData: Array<{ month: string; value: number }>;
  funnelData: Array<{ stage: string; count: number }>;
}

