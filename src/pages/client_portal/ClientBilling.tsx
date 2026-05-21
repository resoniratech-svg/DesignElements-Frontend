import { useState, useMemo } from "react";
import { 
  Receipt, 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useClientInvoices, useClientBillingSummary } from "../../hooks/useClientPortal";
import PageLoader from "../../components/PageLoader";

export default function ClientBilling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading: invoicesLoading } = useClientInvoices();
  const { data: billingSummary, isLoading: statsLoading } = useClientBillingSummary();

  const stats = useMemo(() => {
    const invList = Array.isArray(invoices) ? invoices : [];
    if (billingSummary) return billingSummary;
    
    // Fallback calculation if summary is missing
    const total = invList.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total || inv.amount || 0)), 0);
    const paid = invList.filter((inv: any) => (inv.status || "").toLowerCase() === "paid").reduce((sum: number, inv: any) => sum + (parseFloat(inv.total || inv.amount || 0)), 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [invoices, billingSummary]);

  const filteredInvoices = useMemo(() => {
    const invList = Array.isArray(invoices) ? invoices : [];
    return invList.filter((inv: any) => {
      const invNum = (inv.number || inv.invoiceNo || "").toLowerCase();
      const matchesSearch = invNum.includes(searchTerm.toLowerCase());
      const invStatus = (inv.status || "").toUpperCase();
      let matchesStatus = statusFilter === "all";
      if (statusFilter === "Paid") matchesStatus = invStatus === "PAID";
      if (statusFilter === "Unpaid") matchesStatus = invStatus === "UNPAID" || invStatus === "PENDING";
      if (statusFilter === "Due") matchesStatus = invStatus === "DUE" || invStatus === "PARTIAL" || invStatus === "OVERDUE";
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  if (invoicesLoading || statsLoading) {
    return <PageLoader message="Fetching Secure Billing Records..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Payments</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your invoices, track payments, and download receipts.</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Billed</p>
              <h3 className="text-xl font-black text-slate-900">QAR {(stats.total || 0).toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
              <h3 className="text-xl font-black text-slate-900 text-emerald-600">QAR {(stats.paid || 0).toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-rose-50 p-5 rounded-lg border border-rose-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-sm">
              <CreditCard size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Outstanding Balance</p>
              <h3 className="text-xl font-black text-rose-600">QAR {(stats.pending || 0).toLocaleString()}</h3>
           </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice number..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200">
             {["all", "Paid", "Unpaid", "Due"].map(status => (
               <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                   statusFilter === status 
                   ? "bg-brand-600 text-white shadow-brand-200 shadow-lg" 
                   : "text-slate-500 hover:bg-slate-50"
                 }`}
               >
                 {status}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto text-[13px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv: any) => {
                const invStatusUpper = (inv.status || "").toUpperCase();
                const isOverdue = invStatusUpper !== "PAID" && dayjs(inv.dueDate).isBefore(dayjs(), 'day');
                return (
                  <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-6 py-5 font-bold text-slate-900">{inv.number}</td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{inv.date}</td>
                    <td className="px-6 py-5 font-medium text-slate-500">
                      {isOverdue ? (
                        <div className="flex items-center gap-1.5 text-rose-600">
                           <AlertCircle size={14} /> {inv.dueDate}
                        </div>
                      ) : inv.dueDate}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">QAR {(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-5">
                       <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                            invStatusUpper === "PAID" ? "bg-emerald-100 text-emerald-600" :
                            invStatusUpper === "DUE" ? "bg-orange-100 text-orange-600" :
                            isOverdue ? "bg-rose-100 text-rose-600" :
                            "bg-amber-100 text-amber-600"
                          }`}>
                            {invStatusUpper === "PAID" && <CheckCircle2 size={12} />}
                            {isOverdue ? "OVERDUE" : invStatusUpper === "PENDING" ? "Unpaid" : invStatusUpper === "PARTIAL" ? "Due" : (inv.status || "Unpaid")}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Link to={`/invoice-details/${inv.id}`} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" title="View Invoice">
                            <Eye size={18} />
                         </Link>
                         <button onClick={() => {
                           window.open(`/invoice-details/${inv.id}`, '_blank');
                         }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Download Invoice">
                            <Download size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                    No matching invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
