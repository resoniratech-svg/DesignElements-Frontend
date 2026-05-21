import type { Lead, DashboardStats } from '../types';

const STORAGE_KEY = 'trek_marketing_leads';

// Helper for persistence
const saveLeadsToStorage = (leads: Lead[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

const loadLeadsFromStorage = (): Lead[] | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored leads", e);
    return null;
  }
};

// Initial Data
const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sameer Deep',
    phone: '+971 50 123 4567',
    email: 'sameer.deep@example.ae',
    source: 'LinkedIn',
    status: 'New',
    priority: 'High',
    assignedTo: 'Admin User',
    nextFollowUpDate: '2026-04-01',
    notes: 'Interested in enterprise-level ERP integration for logistics.',
    followUps: [
      { id: 'f1', date: '2026-03-25', notes: 'Initial contact via LinkedIn outreach.', type: 'System' }
    ],
    createdAt: '2026-03-25'
  },
  {
    id: '2',
    name: 'Sarah Rahman',
    phone: '+971 55 987 6543',
    email: 'sarah.r@techsolutions.com',
    source: 'Website',
    status: 'Follow-up',
    priority: 'Medium',
    assignedTo: 'Sales Team',
    nextFollowUpDate: '2026-03-29',
    notes: 'Requested a demo of the inventory and project modules.',
    followUps: [
      { id: 'f2', date: '2026-03-26', notes: 'Scheduled demo for next Monday.', type: 'Call' }
    ],
    createdAt: '2026-03-24'
  },
  {
    id: '3',
    name: 'Michael Chen',
    phone: '+44 20 7123 4567',
    email: 'm.chen@globalkm.net',
    source: 'Referral',
    status: 'Converted',
    priority: 'Low',
    assignedTo: 'Admin User',
    nextFollowUpDate: '',
    notes: 'Onboarding completed. 15 user licenses active.',
    followUps: [
      { id: 'f3', date: '2026-03-20', notes: 'Contract finalized and signed.', type: 'Meeting' }
    ],
    createdAt: '2026-03-15'
  },
  {
    id: '4',
    name: 'Amara Okafor',
    phone: '+234 803 123 4567',
    email: 'amara.okafor@africabiz.com',
    source: 'Google Ads',
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Direct Manager',
    nextFollowUpDate: '2026-03-30',
    notes: 'Comparative analysis phase. High interest in mobile features.',
    followUps: [],
    createdAt: '2026-03-27'
  },
  {
    id: '5',
    name: 'David Wilson',
    phone: '+1 415 555 0123',
    email: 'd.wilson@cloudnexus.io',
    source: 'LinkedIn',
    status: 'New',
    priority: 'Medium',
    assignedTo: 'Admin User',
    nextFollowUpDate: '2026-04-05',
    notes: 'Exploring options for manufacturing ERP.',
    followUps: [],
    createdAt: '2026-03-28'
  },
  {
    id: '6',
    name: 'Elena Rodriguez',
    phone: '+34 91 123 4567',
    email: 'elena.r@iberialogistics.es',
    source: 'Website',
    status: 'Follow-up',
    priority: 'High',
    assignedTo: 'Sales Team',
    nextFollowUpDate: '2026-03-29',
    notes: 'Second meeting scheduled to discuss pricing tiers.',
    followUps: [
      { id: 'f4', date: '2026-03-27', notes: 'Discussed initial requirements.', type: 'Call' }
    ],
    createdAt: '2026-03-26'
  }
];

// Initialize from storage or defaults
const loadedLeads = loadLeadsFromStorage();
let MOCK_LEADS: Lead[] = Array.isArray(loadedLeads) ? loadedLeads : INITIAL_LEADS;

export const leadService = {
  getLeads: async (): Promise<Lead[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return Array.isArray(MOCK_LEADS) ? [...MOCK_LEADS] : [...INITIAL_LEADS]; // Return a copy
  },
  getLeadById: async (id: string): Promise<Lead | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_LEADS.find(l => l.id === id);
  },
  createLead: async (lead: Omit<Lead, 'id' | 'createdAt' | 'followUps'>): Promise<Lead> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      followUps: []
    };
    MOCK_LEADS = [newLead, ...MOCK_LEADS];
    saveLeadsToStorage(MOCK_LEADS);
    return newLead;
  },
  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_LEADS.findIndex(l => l.id === id);
    if (index !== -1) {
      MOCK_LEADS[index] = { ...MOCK_LEADS[index], ...updates };
      saveLeadsToStorage(MOCK_LEADS);
      return MOCK_LEADS[index];
    }
    throw new Error("Lead not found");
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const leads = MOCK_LEADS;
    const totalLeads = leads.length;
    const followedUpLeads = leads.filter(l => l.status === 'Follow-up').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const pendingLeads = leads.filter(l => l.status === 'Pending').length;
    
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    // Monthly data logic - Group leads by month
    const monthlyMap: Record<string, number> = {};
    leads.forEach(l => {
      try {
        const month = new Date(l.createdAt).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      } catch (e) {
        console.error("Invalid date for lead", l.id);
      }
    });
    
    // Ensure we show at least the last 3 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const displayMonths = months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1);
    
    const monthlyData = displayMonths.map(month => ({
      month,
      value: monthlyMap[month] || 0
    }));

    // Funnel data logic
    const funnelData = [
      { stage: 'New', count: leads.filter(l => l.status === 'New').length },
      { stage: 'Contacted', count: leads.filter(l => l.status === 'Follow-up').length },
      { stage: 'Qualified', count: leads.filter(l => l.status === 'Pending').length },
      { stage: 'Converted', count: leads.filter(l => l.status === 'Converted').length },
    ];

    return {
      totalLeads,
      followedUpLeads,
      convertedLeads,
      pendingLeads,
      conversionRate,
      monthlyData,
      funnelData
    };
  },
  deleteLead: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_LEADS = MOCK_LEADS.filter(l => l.id !== id);
    saveLeadsToStorage(MOCK_LEADS);
    console.log(`Lead ${id} deleted from server`);
  }
};
