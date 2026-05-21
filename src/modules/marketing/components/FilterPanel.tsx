import React from 'react';
import type { LeadStatus, LeadPriority } from '../types';

interface FilterPanelProps {
  filters: {
    status: LeadStatus | 'All';
    priority: LeadPriority | 'All';
    source: string;
  };
  onFilterChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const statuses: (LeadStatus | 'All')[] = ['All', 'New', 'Follow-up', 'Converted', 'Lost', 'Pending'];
  const priorities: (LeadPriority | 'All')[] = ['All', 'Low', 'Medium', 'High'];
  const sources = ['All', 'Website', 'Referral', 'LinkedIn', 'Google Ads'];

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
        <select
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 px-3 outline-none transition-all"
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Priority</label>
        <select
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 px-3 outline-none transition-all"
          value={filters.priority}
          onChange={(e) => onFilterChange({ priority: e.target.value })}
        >
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Source</label>
        <select
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 px-3 outline-none transition-all"
          value={filters.source}
          onChange={(e) => onFilterChange({ source: e.target.value })}
        >
          {sources.map((src) => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
