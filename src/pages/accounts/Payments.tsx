
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { Receipt, Download, Search, Filter, Eye, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "../../services/financeService";
import PageLoader from "../../components/PageLoader";
import { exportToCSV } from "../../utils/exportUtils";

function Payments() {
  const { activeDivision } = useDivision();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: financeService.getPayments
  });

  const filteredPayments = useMemo(() => {
    let result = activeDivision === "all" 
      ? payments 
      : payments.filter((p: any) => p.division === activeDivision);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => 
        p.client.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        p.invoice.toLowerCase().includes(q)
      );
    }
    return result;
  }, [payments, activeDivision, searchQuery]);

  const handleExport = () => {
    const dataToExport = filteredPayments.map((p: any) => ({
      "Payment ID": p.id,
      "Client": p.client,
      "Invoice": p.invoice,
      "Amount (QAR)": p.amount,
      "Date": p.date,
      "Sector": p.division
    }));
    exportToCSV(dataToExport, `Payments_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  if (isLoading) {
    return <PageLoader message="Loading financial records..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader showBack 
        title={activeDivision === "all" ? "Payments" : `${currentDivision?.label} Payments`}
        subtitle="Track and manage client payments and receipts"
        action={
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Download size={16} /> Export
            </button>
          </div>
        }
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, client or invoice..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter size={16} />
          <span>Sector: {currentDivision?.label || "All Sectors"}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Payment ID</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Client</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Invoice</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Amount</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Date</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filteredPayments.map((p: any) => (
              <tr key={p.id} className="hover:bg-brand-50/20 transition-colors group">
                <td className="px-6 py-4 font-bold text-brand-600 group-hover:underline cursor-pointer">
                  <Link to={`/invoice-details/${p.dbId || p.id}`}>{p.id}</Link>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{p.client}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black">{p.division} sector</div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">{p.invoice}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900">QAR {parseFloat(p.amount).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{p.date}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={p.status || "Pending"} />
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Link 
                    to={`/invoice-details/${p.dbId || p.id}`}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all inline-flex items-center gap-2"
                  >
                    <Eye size={16} />
                    <span className="text-[10px] font-bold uppercase">View</span>
                  </Link>
                  {p.status?.toUpperCase() === "PAID" && (
                    (() => {
                      const hasDN = p.delivery_note && p.delivery_note.trim() !== "";
                      return (
                        <Link
                          to={hasDN ? `/delivery-note/${p.dbId || p.id}` : `/edit-delivery-note/${p.dbId || p.id}`}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit transition-colors ${
                            hasDN
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                          }`}
                          title={hasDN ? "View Delivery Note" : "Create Delivery Note"}
                        >
                          <FileText size={12} />
                          {hasDN ? 'View DN' : 'Create DN'}
                        </Link>
                      );
                    })()
                  )}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 italic">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Receipt size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">No payment records found</p>
                      <p className="text-xs text-slate-300">Try adjusting your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;