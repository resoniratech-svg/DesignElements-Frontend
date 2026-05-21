export type { LeadStatus, LeadPriority, FollowUp, Lead } from '../../../types/marketing';

export interface MarketingNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'admin';
  timestamp: string;
  isRead: boolean;
  leadId?: string;
}

export interface DashboardStats {
  totalLeads: number;
  followedUpLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  conversionRate: number;
  monthlyData: { month: string; value: number }[];
  funnelData: { stage: string; count: number }[];
}
