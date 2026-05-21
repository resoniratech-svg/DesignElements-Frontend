import { useState } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  Eye,
  TrendingUp,
  Loader2,
  Check,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { downloadMockFile } from "../../utils/exportUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationService, type Quotation } from "../../services/quotationService";

export default function ClientQuotations() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: quoteResponse, isLoading } = useQuery({
    queryKey: ["client-quotations"],
    queryFn: () => quotationService.getQuotations(1, 100) // Fetch all for portal
  });

  const quotations = quoteResponse?.data || [];

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
        quotationService.updateQuotation(id, { status }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["client-quotations"] });
    },
    onError: (err: any) => {
        console.error("STATUS UPDATE ERROR:", err);
    }
  });

  const handleStatusUpdate = (id: string, newStatus: string) => {
    const action = newStatus === "APPROVED" ? "approve" : "reject";
    if (window.confirm(`Are you sure you want to ${action} this quotation?`)) {
      mutation.mutate({ id, status: newStatus });
    }
  };

  const filtered = (quotations || []).filter(p => 
    (p.qtn_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.terms?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve your service proposals and cost estimations.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center gap-3 pr-6">
              <TrendingUp size={20} />
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Pending Value</p>
                <p className="text-sm font-black mt-0.5">
                  QAR {quotations.filter(p => {
                    const s = (p.status || "").toUpperCase();
                    return s === "PENDING" || s === "PENDING_APPROVAL";
                  }).reduce((s, p) => s + (Number(p.total_amount) || 0), 0).toLocaleString()}
                </p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/20">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by quotation number or service..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Fetching quotations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.length > 0 ? filtered.map((prop: Quotation) => (
              <div key={prop.id || prop.qtn_number} className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <FileText size={24} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    (prop.status || "").toUpperCase() === "APPROVED" ? "bg-emerald-100 text-emerald-600" :
                    (prop.status || "").toUpperCase() === "REJECTED" || (prop.status || "").toUpperCase() === "DECLINED" ? "bg-rose-100 text-rose-600" :
                    "bg-amber-100 text-amber-600"
                  }`}>
                    {(prop.status || "").toUpperCase() === "PENDING_APPROVAL" ? "Pending" : (prop.status || "Pending")}
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{prop.division?.toUpperCase() || "General"} Quotation</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{prop.qtn_number}</p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Amount</p>
                    <p className="text-lg font-black text-slate-900 mt-0.5">QAR {(Number(prop.total_amount) || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Issued Date</p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">{formatDate(prop.created_at)}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link 
                    to={`/quotation-details/${prop.id}`}
                    className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl transition-all"
                  >
                    <Eye size={14} /> Review
                  </Link>
                  <button 
                    onClick={() => downloadMockFile(`${prop.qtn_number}.pdf`, `Quotation: ${prop.qtn_number}`)} 
                    className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl transition-all"
                  >
                    <Download size={14} /> PDF
                  </button>

                  {(() => {
                    const s = (prop.status || "").toUpperCase();
                    return s !== "APPROVED" && s !== "REJECTED" && s !== "DECLINED";
                  })() && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(prop.id!, "APPROVED")}
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg shadow-emerald-50 disabled:opacity-50"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(prop.id!, "REJECTED")}
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 py-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-400 italic font-medium">
                 <FileText size={48} className="mx-auto mb-4 opacity-20" />
                 No quotations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
