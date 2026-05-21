import type { DivisionId } from "../constants/divisions";
import type { Invoice } from "./finance";
import type { Job } from "./project";

export interface DashboardStats {
  totalReceivables: number;
  totalPayables: number;
  activeProjects: number;
  totalRevenue: number;
  totalEmployees: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface DivisionPerformance {
  division: DivisionId;
  label: string;
  color: string;
  revenue: number;
  expense: number;
  projects: number;
  profit: number;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  divisionPerformance: DivisionPerformance[];
  revenueTrends: RevenueTrend[];
  pendingPayments: any[]; // Or more specific
  activeProjects: any[];
  leadFunnel: Array<{ stage: string; count: number }>;
  recentInvoices: any[];
}

export interface AccountsDashboardData {
  stats: {
    receivables: number;
    payables: number;
    pendingPayments: number;
    profitMargin: string;
  };
  financialData: Array<{ month: string; receivables: number; payables: number }>;
  recentInvoices: Invoice[];
}

export interface PMDashboardData {
  stats: {
    activeProjects: number;
    ongoingJobs: number;
    completedJobs: number;
    overdueTasks: number;
  };
  projectDistribution: Array<{ name: string; value: number }>;
  recentJobs: Job[];
}
