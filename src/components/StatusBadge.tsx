interface Props {
  status: string;
}

const statusStyles: Record<string, string> = {
  "New": "bg-gray-100 text-gray-600 ring-gray-200",
  "Submitted": "bg-amber-50 text-amber-700 ring-amber-200",
  "Under Process": "bg-blue-50 text-blue-700 ring-blue-200",
  "Approved": "bg-violet-50 text-violet-700 ring-violet-200",
  "Completed": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Delivered": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Paid": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Unpaid": "bg-red-50 text-red-700 ring-red-200",
  "Pending": "bg-amber-50 text-amber-700 ring-amber-200",
  "Overdue": "bg-red-50 text-red-700 ring-red-200",
  "Due": "bg-amber-50 text-amber-700 ring-amber-200",
  "Active": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Inactive": "bg-gray-100 text-gray-600 ring-gray-200",
  "Expiring Soon": "bg-amber-50 text-amber-700 ring-amber-200",
  "Expired": "bg-rose-50 text-rose-700 ring-rose-200",
  "EXPIRING SOON": "bg-amber-50 text-amber-700 ring-amber-200",
  "EXPIRED": "bg-rose-50 text-rose-700 ring-rose-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  "COMPLETED": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Cancelled": "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusBadge({ status }: Props) {
  if (!status) return <span className="text-[10px] text-slate-400">N/A</span>;

  // Normalize string for lookup: "PENDING_APPROVAL" -> "Pending Approval"
  const normalizedStatus = status.replace(/_/g, ' ').split(' ').map(word => 
    word ? (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) : ''
  ).join(' ');

  let displayStatus = normalizedStatus;
  if (normalizedStatus.toUpperCase() === "PENDING") displayStatus = "Unpaid";
  if (normalizedStatus.toUpperCase() === "PARTIAL") displayStatus = "Due";

  const style = statusStyles[displayStatus] || statusStyles[normalizedStatus] || statusStyles[status] || "bg-gray-100 text-gray-600 ring-gray-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] rounded-full font-medium ring-1 ring-inset ${style}`}>
      <span
        className={`w-1 h-1 rounded-full mr-1.5 ${style.includes("emerald") ? "bg-emerald-500" :
            style.includes("amber") ? "bg-amber-500" :
              style.includes("blue") ? "bg-blue-500" :
                style.includes("violet") ? "bg-violet-500" :
                    style.includes("rose") ? "bg-rose-500" :
                    style.includes("red") ? "bg-red-500" :
                    style.includes("orange") ? "bg-orange-500" :
                      style.includes("indigo") ? "bg-indigo-500" :
                        "bg-gray-400"}`}/>
      {displayStatus}
    </span>
  );
}

export default StatusBadge;