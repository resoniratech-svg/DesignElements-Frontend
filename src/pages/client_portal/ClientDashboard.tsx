import { useMemo } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { 
  Briefcase, 
  FileText, 
  ClipboardList,
  CreditCard,
  AlertTriangle,
  ArrowRight, 
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { 
  useClientDashboard, 
  useClientDocuments, 
  useClientBillingSummary
} from "../../hooks/useClientPortal";

export default function ClientDashboard() {
  // 1. Fetch dashboard stats (real counts from backend)
  const { data: dashboard, isLoading: dashLoading } = useClientDashboard();
  const { data: proDocs = [], isLoading: docsLoading } = useClientDocuments();
  const { data: billingSummary, isLoading: billingLoading } = useClientBillingSummary();

  // Fetch projects list for display
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["client-projects"],
    queryFn: async () => {
      const { data } = await api.get("/client/projects");
      return data?.data || data || [];
    }
  });

  // Fetch Quotations list for display
  const { data: quotations = [], isLoading: quotationsLoading } = useQuery({
    queryKey: ["client-quotations-list"],
    queryFn: async () => {
      const { data } = await api.get("/quotations");
      return data?.data || data || [];
    }
  });

  // Fetch BOQs list for display
  const { data: boqs = [], isLoading: boqsLoading } = useQuery({
    queryKey: ["client-boqs-list"],
    queryFn: async () => {
      const { data } = await api.get("/boqs");
      return data?.data || data || [];
    }
  });

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeBoqs = Array.isArray(boqs) ? boqs : [];
  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const safeDocs = Array.isArray(proDocs) ? proDocs : [];

  // Use real stats from the backend dashboard endpoint
  const stats = useMemo(() => {
    const dashStats = dashboard?.stats || {};
    return {
      activeProjects: dashStats.activeProjects || 0,
      totalBoqs: dashStats.totalBoqs || 0,
      totalQuotations: dashStats.totalQuotations || 0,
      pendingBilling: Number(dashStats.pendingBilling || 0),
      totalExpiringEmployees: dashStats.expiringEmployees || 0
    };
  }, [dashboard]);

  const isLoading = dashLoading || docsLoading || billingLoading || projectsLoading || boqsLoading || quotationsLoading;

  if (isLoading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Welcome Back! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Your business overview at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/client/support"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
             <MessageSquare size={14} className="text-brand-500" /> Support Desk
          </Link>
        </div>
      </div>

      {/* Summary Stats - 5 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={<Briefcase size={20} className="text-blue-500" />}
          path="/client/projects"
        />
        <StatCard
          title="BOQs"
          value={stats.totalBoqs.toString()}
          icon={<ClipboardList size={20} className="text-violet-500" />}
          path="/client/boq"
        />
        <StatCard
          title="Quotations"
          value={stats.totalQuotations.toString()}
          icon={<FileText size={20} className="text-amber-500" />}
          path="/client/quotations"
        />
        <StatCard
          title="Pending Billings"
          value={`QAR ${stats.pendingBilling.toLocaleString()}`}
          icon={<CreditCard size={20} className="text-rose-500" />}
          path="/client/billing"
        />
        <StatCard
          title="Expiring Employees"
          value={stats.totalExpiringEmployees.toString()}
          icon={<AlertTriangle size={20} className={stats.totalExpiringEmployees > 0 ? "text-amber-500" : "text-emerald-500"} />}
          trend={stats.totalExpiringEmployees > 0 ? { value: "Needs Attention", positive: false } : undefined}
          path="/client/pro-services"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects & BOQs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Projects List */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Briefcase size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Active Projects</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your currently running projects</p>
                </div>
              </div>
              <Link to="/client/projects" className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {safeProjects.slice(0, 4).map((project: any) => (
                <div key={project.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">
                        {(project.project_name || project.name || "P").charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{project.project_name || project.name || project.title || "Project"}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {project.status || "Active"} • {project.division || ""}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      project.status?.toLowerCase() === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      project.status?.toLowerCase() === "on hold" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                      {project.status || "Active"}
                    </span>
                  </div>
                </div>
              ))}
              {safeProjects.length === 0 && (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">No projects assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Quotations */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FileText size={18} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Recent Quotations</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Latest quotations for your review</p>
                </div>
              </div>
              <Link to="/client/quotations" className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {safeQuotations.slice(0, 4).map((q: any) => (
                <div key={q.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{q.quotation_number || q.title || `QTN-${q.id}`}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {dayjs(q.created_at || q.date).format("DD MMM YYYY")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">
                        {q.total_amount ? `QAR ${Number(q.total_amount).toLocaleString()}` : "—"}
                      </p>
                      <span className={`text-[9px] font-black uppercase ${
                        q.status?.toLowerCase() === "approved" ? "text-emerald-600" :
                        q.status?.toLowerCase() === "rejected" ? "text-rose-600" :
                        "text-amber-600"
                      }`}>
                        {q.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {safeQuotations.length === 0 && (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">No quotations available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Billing & PRO Expiry */}
        <div className="space-y-6">

          {/* Pending Billings Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <CreditCard size={18} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Billing Overview</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Your payment summary</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Total Billed</span>
                  <span className="text-sm font-black text-slate-800">QAR {Number(billingSummary?.total || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-600 font-medium">Paid</span>
                  <span className="text-sm font-black text-emerald-700">QAR {Number(billingSummary?.paid || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-rose-600 font-medium">Pending</span>
                  <span className="text-sm font-black text-rose-700">QAR {Number(billingSummary?.pending || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Link 
              to="/client/billing" 
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
            >
              View Invoices <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* PRO Services - Expiring Employees */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest">PRO Services</h3>
                <p className="text-[10px] text-white/40 mt-0.5">Employee document status</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {safeDocs.filter((d: any) => d.status === "Expiring Soon" || d.status === "Expired").length > 0 ? (
                safeDocs
                  .filter((d: any) => d.status === "Expiring Soon" || d.status === "Expired")
                  .map((doc: any) => (
                    <div key={doc.id} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          doc.status === 'Expired' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                          'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate">{doc.name}</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            {doc.status === "Expired" ? "Expired" : "Expires"}: {dayjs(doc.expiryDate).format("DD MMM YYYY")}
                          </p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          doc.status === "Expired" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {doc.status === "Expired" ? "Expired" : "Expiring"}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white/60">All employee documents are valid</p>
                  <p className="text-[10px] text-white/30 mt-1">No expiring or expired documents</p>
                </div>
              )}
            </div>

            <Link 
              to="/client/pro-services" 
              className="mt-5 py-2.5 w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all flex items-center justify-center gap-2 group"
            >
              Manage PRO Services <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* BOQ Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <ClipboardList size={18} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">BOQ Summary</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Bill of quantities overview</p>
              </div>
            </div>
            <div className="space-y-3">
              {safeBoqs.slice(0, 3).map((boq: any) => (
                <div key={boq.id} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{boq.title || boq.boq_number || `BOQ-${boq.id}`}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{dayjs(boq.created_at).format("DD MMM YYYY")}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      boq.status?.toLowerCase() === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-violet-50 text-violet-600 border-violet-100"
                    }`}>
                      {boq.status || "Draft"}
                    </span>
                  </div>
                </div>
              ))}
              {safeBoqs.length === 0 && (
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <ClipboardList size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">No BOQs available</p>
                </div>
              )}
            </div>
            <Link 
              to="/client/boq" 
              className="mt-4 text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              View All BOQs <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}