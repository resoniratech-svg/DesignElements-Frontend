import { create } from 'zustand';
import type { Lead, LeadStatus, LeadPriority } from '../types';

interface LeadState {
  leads: Lead[];
  selectedLead: Lead | null;
  filters: {
    search: string;
    status: LeadStatus | 'All';
    priority: LeadPriority | 'All';
    source: string;
  };
  isLoading: boolean;
  setLeads: (leads: Lead[]) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setFilters: (filters: Partial<LeadState['filters']>) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  selectedLead: null,
  filters: {
    search: '',
    status: 'All',
    priority: 'All',
    source: 'All',
  },
  isLoading: false,
  setLeads: (leads) => set({ leads }),
  setSelectedLead: (selectedLead) => set({ selectedLead }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  updateLead: (id, updatedLead) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...updatedLead } : l)),
      selectedLead: state.selectedLead?.id === id ? { ...state.selectedLead, ...updatedLead } : state.selectedLead,
    })),
  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
      selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
