import React from 'react';
import type { LeadPriority } from '../types';

interface PriorityBadgeProps {
  priority: LeadPriority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityStyles: Record<LeadPriority, string> = {
    'Low': 'bg-green-50 text-green-600',
    'Medium': 'bg-yellow-50 text-yellow-600',
    'High': 'bg-red-50 text-red-600',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
