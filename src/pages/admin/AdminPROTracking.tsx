import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  X,
  Info,
  Users,
  Edit2,
  Trash2
} from "lucide-react";
import PageLoader from "../../components/PageLoader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proService } from "../../services/proService";
import { employeeService } from "../../services/employeeService";
import StatCard from "../../components/StatCard";
import { useDivision } from "../../context/DivisionContext";

export default function AdminPROTracking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  const [showDocModal, setShowDocModal] = useState({ open: false, type: "", docs: [] as any[] });

  // 1. Fetch Data
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["pro-contracts"],
    queryFn: proService.getContracts
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["pro-all-documents"],
    queryFn: proService.getAllDocuments
  });
  
  // 1.1 Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["pro-all-documents"] });
      alert("Employee deleted successfully");
    },
    onError: (err: any) => {
      console.error("[ERROR] Delete failed:", err);
      alert(err.message || "Failed to delete employee");
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };


  // Ensure data variables are arrays to prevent crashes
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];

  const sectorFilteredContracts = useMemo(() => {
    let base = safeContracts;
    if (activeDivision && activeDivision !== "all") {
      base = base.filter((c: any) =>
        c.sector?.toString().trim().toUpperCase() === activeDivision.toUpperCase() ||
        c.division?.toString().trim().toUpperCase() === activeDivision.toUpperCase()
      );
    }
    
    return base;
  }, [safeContracts, activeDivision]);

  const filteredContracts = sectorFilteredContracts;

  const totalEmployeesCount = useMemo(() => {
    return sectorFilteredContracts.length;
  }, [sectorFilteredContracts]);

  const activeEmployeesCount = useMemo(() => {
    return sectorFilteredContracts.filter((c: any) => c && (c.status === "Active" || c.status === "Active")).length;
  }, [sectorFilteredContracts]);


  // Removed unused pendingTasks and highPriorityTasks variables

  const expiringSoonDocs = useMemo(() => {
    let base = safeDocuments.filter((d: any) => d && d.status === "Expiring Soon");
    if (activeDivision && activeDivision !== "all") {
      base = base.filter((d: any) => 
        d.sector?.toString().trim().toUpperCase() === activeDivision.toUpperCase() ||
        d.division?.toString().trim().toUpperCase() === activeDivision.toUpperCase()
      );
    }
    return base;
  }, [safeDocuments, activeDivision]);

  const expiredDocs = useMemo(() => {
    let base = safeDocuments.filter((d: any) => d && d.status === "Expired");
    if (activeDivision && activeDivision !== "all") {
      base = base.filter((d: any) => 
        d.sector?.toString().trim().toUpperCase() === activeDivision.toUpperCase() ||
        d.division?.toString().trim().toUpperCase() === activeDivision.toUpperCase()
      );
    }
    return base;
  }, [safeDocuments, activeDivision]);



  if (contractsLoading || docsLoading) {
    return <PageLoader message="Aggregating Global Compliance Data..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-brand-600" size={32} />
            Employee PRO Tracking
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitoring employee QID, Passport, and other critical compliance documents</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployeesCount.toString()}
          icon={<Users className="text-brand-600" size={20} />}
          trend={{ value: "Staff Tracked", positive: true }}
        />
        <StatCard
          title="Active Employees"
          value={activeEmployeesCount.toString()}
          icon={<Users className="text-brand-600" size={20} />}
          trend={{ value: "Current Active", positive: true }}
        />
        <StatCard
          title="Expiring Documents"
          value={expiringSoonDocs.length.toString()}
          icon={<AlertTriangle className="text-orange-500" size={20} />}
          trend={{ value: "Action Required", positive: false }}
          onClick={() => setShowDocModal({ open: true, type: "Expiring Soon", docs: expiringSoonDocs })}
        />
        <StatCard
          title="Expired Documents"
          value={expiredDocs.length.toString()}
          icon={<AlertTriangle className="text-rose-500" size={20} />}
          trend={{ value: "Critical Alerts", positive: false }}
          onClick={() => setShowDocModal({ open: true, type: "Expired", docs: expiredDocs })}
        />
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Management Actions</h2>
            <p className="text-[10px] text-slate-500 font-medium">Create new employee records or generate compliance reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/employees/create")}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
          >
            <Users size={14} /> Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Contracts List */}
        <div className="lg:col-span-12 space-y-8">
          <div className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Document Tracking</h2>
              </div>
              <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-black">{filteredContracts.length} Total Staff</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee / Division</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredContracts.map((contract: any) => {
                    return (
                      <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                              {contract.title?.charAt(0) || "E"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{contract.title || "Unknown Employee"}</p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase">{contract.sector}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-700">{contract.role || "Staff"}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{contract.companyName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${contract.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => navigate(`/employees/edit/${contract.id}`)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => navigate(`/employees/details/${contract.id}`)}
                              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                              title="View Details"
                            >
                              <ArrowRight size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(contract.id, contract.title)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {/* Document Detail Modal */}
      {showDocModal.open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`p-6 flex items-center justify-between border-b ${showDocModal.type === 'Expired' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${showDocModal.type === 'Expired' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{showDocModal.type} Documents</h2>
                  <p className="text-slate-500 text-xs font-semibold">{showDocModal.docs.length} critical items require immediate attention</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal({ open: false, type: "", docs: [] })}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee / Division</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Joining Info</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showDocModal.docs.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{doc.clientName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mb-1">{doc.companyName}</p>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-bold uppercase tracking-wider">{doc.sector || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700 text-sm italic">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.number}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold text-slate-600">Joined: {doc.contractStartDate ? dayjs(doc.contractStartDate).format("DD MMM, YYYY") : "N/A"}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <p className={`font-black text-sm ${showDocModal.type === 'Expired' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {dayjs(doc.expiryDate).format("DD MMM, YYYY")}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{dayjs(doc.expiryDate).fromNow()}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-400">
                <Info size={14} />
                <p className="text-[10px] font-medium leading-none">Automated expiry tracking based on 30-day window.</p>
              </div>
              <button
                onClick={() => setShowDocModal({ open: false, type: "", docs: [] })}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-all"
              >
                Close Detail View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
