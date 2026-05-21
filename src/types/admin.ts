import type { DivisionId } from "../constants/divisions";
import type { Invoice } from "./finance";

export interface DashboardStats {
  totalReceivables: number;
  totalPayables: number;
  activeProjects: number;
  inactiveProjects: number;
  completedProjects: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface DivisionPerformance {
  division: DivisionId;
  label: string;
  revenue: number;
  profit: number;
  projects: number;
  color: string;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  expense: number;
}

export interface LeadFunnelStage {
  stage: string;
  count: number;
}

export interface AdminProject {
  id: string;
  name: string;
  client: string;
  division: string;
  status: string;
  deadline?: string;
  jobCount: number;
}

export interface RecentExpense {
  id: string;
  title: string;
  createdBy: string;
  sector: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  date: string;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  divisionPerformance: DivisionPerformance[];
  revenueTrends: RevenueTrend[];
  pendingPayments: Invoice[];
  activeProjects: AdminProject[];
  leadFunnel: LeadFunnelStage[];
  recentInvoices: Invoice[];
  recentExpenses: RecentExpense[];
}
