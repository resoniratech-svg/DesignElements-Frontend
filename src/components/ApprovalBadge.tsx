import type { ApprovalStatus } from "../types/approvals";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  status?: ApprovalStatus;
  showIcon?: boolean;
}

export default function ApprovalBadge({ status = "pending", showIcon = true }: Props) {
  // Normalize status from backend (e.g. "PENDING_APPROVAL" -> "pending")
  const normalizedStatus = String(status).toLowerCase().replace('_approval', '') as any;

  const configs: any = {
    pending: {
      label: "Pending",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock
    },
    approved: {
      label: "Approved",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2
    },
    rejected: {
      label: "Rejected",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircle
    },
    submitted: {
      label: "Submitted",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: Clock
    },
    due: {
      label: "Due",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Clock
    }
  };

  const config = configs[normalizedStatus] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {showIcon && <Icon size={12} strokeWidth={2.5} />}
      {config.label}
    </span>
  );
}
