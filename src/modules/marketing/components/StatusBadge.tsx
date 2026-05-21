import React from 'react';
import type { LeadStatus } from '../types';

interface StatusBadgeProps {
  status: LeadStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<LeadStatus, string> = {
    'New': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contacted': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Follow-up': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Converted': 'bg-green-100 text-green-700 border-green-200',
    'Lost': 'bg-red-100 text-red-700 border-red-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
    'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
