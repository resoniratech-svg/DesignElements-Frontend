import React, { useState } from 'react';
import { Plus, Download, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportToCSV } from '../../../utils/exportUtils';
import { useLeadStore } from '../store/leadStore';
import { leadService } from '../../../services/leadService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PageLoader from '../../../components/PageLoader';
import { useDivision } from '../../../context/DivisionContext';
import { getDivisionById } from '../../../constants/divisions';
import type { Lead } from '../types';

const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  const { filters, setFilters } = useLeadStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch data
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['leads', activeDivision],
    queryFn: () => leadService.getLeads(activeDivision) as any 
  });

  // 2. Mutations
  const deleteMutation = useMutation({
    mutationFn: leadService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error: Error) => {
      alert(`Failed to delete lead: ${error.message || 'Unknown error'}`);
    }
  });

  const safeLeads = Array.isArray(leads) ? leads : [];
  const filteredLeads = safeLeads.filter((lead: Lead) => {
    if (!lead) return false;
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = (lead.name || "").toLowerCase().includes(searchLower) ||
                         (lead.email || "").toLowerCase().includes(searchLower) ||
                         (lead.phone || "").includes(filters.search);
    const matchesStatus = filters.status === 'All' || lead.status === filters.status;
    const matchesPriority = filters.priority === 'All' || lead.priority === filters.priority;
    const matchesSource = filters.source === 'All' || lead.source === filters.source;

    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const handleDeleteLead = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const dataForExport = filteredLeads.map((l: Lead) => ({
      Name: l.name,
      Email: l.email,
      Phone: l.phone,
      Source: l.source,
      Status: l.status,
      Priority: l.priority,
      Created: l.createdAt
    }));
    exportToCSV(dataForExport, "leads_export.csv");
  };

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Users className="text-brand-600" size={32} />
             Leads Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Manage and track your marketing leads effectively with real-time insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
          >
            <Download size={16} /> Export Data
          </button>
          <button 
            onClick={() => navigate('/marketing/leads/new')}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-100"
          >
            <Plus size={16} /> Add New Lead
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SearchBar value={filters.search} onChange={(val) => setFilters({ search: val })} />
        <FilterPanel filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto text-[13px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Channels</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sector</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Expert</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <PageLoader message="Filtering Marketing Leads..." />
                  </td>
                </tr>
              ) : paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead: Lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer uppercase text-xs" onClick={() => navigate(`/marketing/leads/${lead.id}`)}>
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{lead.email}</div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 uppercase tracking-tight">{lead.source}</td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex justify-center">
                           <StatusBadge status={lead.status} />
                        </div>
                     </td>
                     <td className="px-8 py-5 text-center">
                        {lead.division && (
                          <div className="flex justify-center">
                             <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getDivisionById(lead.division).bg} ${getDivisionById(lead.division).text} ${getDivisionById(lead.division).border}`}>
                                {lead.division}
                             </div>
                          </div>
                        )}
                     </td>
                     <td className="px-8 py-5">
                      <PriorityBadge priority={lead.priority || 'Medium'} />
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-700 uppercase">{lead.assignedTo || 'Unassigned'}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/marketing/leads/${lead.id}`); }} 
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/marketing/leads/edit/${lead.id}`); }} 
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Edit Lead"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id, lead.name); }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Lead"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic font-medium">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLeads.length > itemsPerPage && (
          <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{startIndex + 1}</span> —{' '}
              <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredLeads.length)}</span> of{' '}
              <span className="text-slate-900">{filteredLeads.length}</span> Results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;
