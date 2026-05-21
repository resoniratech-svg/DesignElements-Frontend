import { useState, useEffect } from "react";
import { useApprovals } from "../../hooks/useApprovals";
import { Check, X, Eye, FileText, ClipboardList, Receipt, CreditCard, Search, Filter } from "lucide-react";
import ApprovalBadge from "../../components/ApprovalBadge";
import { DIVISIONS } from "../../constants/divisions";
import { useDivision } from "../../context/DivisionContext";
import dayjs from "dayjs";

export default function AdminApprovals() {
  const { pendingItems, loading, fetchPending, processDecision } = useApprovals();
  const { activeDivision } = useDivision();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPending(filter, activeDivision);
  }, [fetchPending, filter, activeDivision]);

  const filteredApprovals = pendingItems; // Temporarily bypass filters to check data flow

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "invoice": return <Receipt size={16} className="text-blue-500" />;
      case "quotation": return <FileText size={16} className="text-amber-500" />;
      case "expense": return <CreditCard size={16} className="text-rose-500" />;
      case "credit": return <ClipboardList size={16} className="text-emerald-500" />;
      default: return <FileText size={16} />;
    }
  };

  const getDivisionBadge = (divId: number) => {
    const div = DIVISIONS.find(d => Number(d.id) === divId || d.id === String(divId));
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${div?.bg || 'bg-slate-100'} ${div?.text || 'text-slate-600'} border ${div?.border || 'border-slate-200'}`}>
        {div?.label.split(" ")[0] || `DIV ${divId}`}
      </span>
    );
  };

  const handleAction = async (item: any, status: 'approved' | 'rejected') => {
    const confirmMsg = `Are you sure you want to ${status} ${item.type} ${item.number}?`;
    if (window.confirm(confirmMsg)) {
      const result = await processDecision(item.type, item.id, status);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {filter === 'pending' ? 'Pending Approvals' : filter === 'approved' ? 'Approval History' : 'Rejected Requests'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filter === 'pending' ? 'Review and action requests for invoices, quotations, and expenses.' : `Viewing ${filter} documents across sectors.`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Document Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoices</option>
              <option value="quotation">Quotations</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-gray-600">Request Details</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Division</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Requested At</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                          <Check size={24} className="text-gray-300" />
                        </div>
                        <p>No {filter} requests found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((app) => (
                    <tr key={`${app.type}-${app.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            {getTypeIcon(app.type)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{app.number}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{app.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getDivisionBadge(app.division_id)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {app.total_amount ? `QAR ${app.total_amount.toLocaleString()}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-xs">
                          {dayjs(app.created_at).format("MMM DD, YYYY")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ApprovalBadge status={app.status as any} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(app, 'approved')}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Approve"
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleAction(app, 'rejected')}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Reject"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                          <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
