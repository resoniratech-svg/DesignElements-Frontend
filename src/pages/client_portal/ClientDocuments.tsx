import { useState, useMemo } from "react";
import { 
  Folder, 
  FileText, 
  Receipt, 
  ShieldCheck, 
  Search, 
  Download, 
  Eye, 
  Tag,
  Calendar,
  Filter,
  AlertCircle
} from "lucide-react";
import dayjs from "dayjs";
import { useClientDocuments } from "../../hooks/useClientPortal";
import { downloadMockFile } from "../../utils/exportUtils";

const mockDocuments = [
  { id: "M-1", title: "Villa A-21 Service Agreement", type: "Agreement", date: "2026-03-01", size: "1.2 MB", category: "Legal" },
  { id: "M-2", title: "Invoice INV-202 - Installation", type: "Invoice", date: "2026-03-15", size: "245 KB", category: "Billing" },
  { id: "M-3", title: "Project Estimation - QTN-405", type: "Quotation", date: "2026-03-05", size: "512 KB", category: "Estimation" },
  { id: "M-4", title: "Weekly Progress Report - Mar W2", type: "Report", date: "2026-03-12", size: "3.5 MB", category: "Progress" },
  { id: "M-5", title: "Signed BOQ - Interior Works", type: "BOQ", date: "2026-02-28", size: "890 KB", category: "Technical" },
];

export default function ClientDocuments() {
  const { data: proDocs = [] } = useClientDocuments();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Compliance", "Billing", "Estimation", "Legal", "Progress", "Technical"];

  const filtered = useMemo(() => {
    const complianceDocs = proDocs.map((d: any) => ({
      id: d.id,
      title: d.name,
      type: "Compliance",
      date: d.expiryDate,
      size: "External Link",
      category: "Compliance",
      status: d.status
    }));

    const allDocs = [...complianceDocs, ...mockDocuments];

    return allDocs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === "All" || doc.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, activeCategory, proDocs]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document Vault</h1>
          <p className="text-sm text-slate-500 mt-1">Access all your project files, agreements, and compliance documents.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-brand-100">
              {filtered.length} Total Files
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Filter size={14} /> Categories
            </h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeCategory === cat 
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                  {cat === "Compliance" && filtered.some(d => d.category === "Compliance" && d.status !== "Valid") && (
                    <AlertCircle size={14} className={activeCategory === cat ? "text-white" : "text-amber-500"} />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-lg text-white shadow-lg shadow-slate-200 relative overflow-hidden group">
             <div className="relative z-10">
                <h4 className="text-[10px] uppercase font-black text-white/40 tracking-widest">Storage Status</h4>
                <div className="mt-4 flex items-end gap-2">
                   <span className="text-2xl font-black">Secure</span>
                   <span className="text-[10px] mb-1.5 opacity-60">End-to-end encrypted</span>
                </div>
                <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold transition-all">
                  Request Backup
                </button>
             </div>
             <ShieldCheck size={80} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* Document Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by file name..." 
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length > 0 ? filtered.map((doc: any) => (
              <div key={doc.id} className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all group flex items-start gap-4 h-full relative overflow-hidden">
                {doc.category === 'Compliance' && doc.status !== 'Valid' && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className={`absolute top-2 -right-6 w-24 py-1 text-[8px] font-black text-center text-white uppercase rotate-45 ${
                      doc.status === 'Expired' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}>
                      {doc.status}
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-xl flex-shrink-0 transition-all ${
                  doc.category === 'Compliance' ? 'bg-slate-900 text-white' :
                  doc.category === 'Billing' ? 'bg-emerald-50 text-emerald-600' :
                  doc.category === 'Legal' ? 'bg-amber-50 text-amber-600' :
                  doc.category === 'Estimation' ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-50 text-slate-500'
                }`}>
                   {doc.category === 'Compliance' ? <ShieldCheck size={24} /> :
                    doc.type === 'Invoice' ? <Receipt size={24} /> :
                    doc.type === 'Agreement' ? <FileText size={24} /> :
                    <FileText size={24} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate pr-10 group-hover:text-brand-600 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <Tag size={10} /> {doc.category}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <Calendar size={10} /> {doc.category === 'Compliance' ? `Exp: ${dayjs(doc.date).format("DD MMM, YY")}` : doc.date}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300">{doc.category === 'Compliance' ? doc.status : doc.size}</span>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" title="View">
                          <Eye size={16} />
                       </button>
                       <button onClick={() => downloadMockFile(doc.title, "Simulated document content")} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Download">
                          <Download size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-400 italic font-medium bg-white rounded-lg border border-dashed border-slate-200">
                 <Folder size={48} className="mx-auto mb-4 opacity-20" />
                 No documents found for "{searchTerm}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
