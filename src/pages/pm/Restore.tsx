import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  FileText,
  ScrollText,
  Truck,
  Award,
  ArrowLeft,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { restoreService } from "../../services/restoreService";

type TabType = "quotations" | "invoices" | "deliveryNotes" | "completionCertificates";

export default function Restore() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("quotations");

  // State for permanent delete confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "quotation" | "invoice" | "delivery_note" | "completion_certificate";
    id: string | number;
    title: string;
    description: string;
  } | null>(null);

  // Success / error message banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch deleted items (unified across all sectors, always fresh)
  const { data, isLoading } = useQuery({
    queryKey: ["deletedItems"],
    queryFn: () => restoreService.getDeletedItems("all"),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: ({ type, id }: { type: "quotation" | "invoice" | "delivery_note" | "completion_certificate"; id: string | number }) =>
      restoreService.restoreItem(type, id),
    onSuccess: (res) => {
      showNotification("success", res.message || "Item restored successfully");
      queryClient.invalidateQueries({ queryKey: ["deletedItems"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["creditSummary"] });
      queryClient.invalidateQueries({ queryKey: ["creditInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      showNotification("error", err.response?.data?.message || "Failed to restore item");
    }
  });

  // Permanent Delete Mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: "quotation" | "invoice" | "delivery_note" | "completion_certificate"; id: string | number }) =>
      restoreService.permanentDeleteItem(type, id),
    onSuccess: (res) => {
      showNotification("success", res.message || "Item permanently deleted from database");
      setConfirmModal(null);
      queryClient.invalidateQueries({ queryKey: ["deletedItems"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["creditSummary"] });
      queryClient.invalidateQueries({ queryKey: ["creditInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      showNotification("error", err.response?.data?.message || "Failed to delete item");
      setConfirmModal(null);
    }
  });

  const counts = data?.counts || {
    quotations: 0,
    invoices: 0,
    deliveryNotes: 0,
    completionCertificates: 0,
    total: 0
  };

  const handleRestore = (type: "quotation" | "invoice" | "delivery_note" | "completion_certificate", id: string | number) => {
    restoreMutation.mutate({ type, id });
  };

  const openPermanentDeleteModal = (
    type: "quotation" | "invoice" | "delivery_note" | "completion_certificate",
    id: string | number,
    title: string,
    description: string
  ) => {
    setConfirmModal({
      isOpen: true,
      type,
      id,
      title,
      description
    });
  };

  // Build Table Data based on Active Tab
  let tableData: any[] = [];
  let columns: string[] = [];

  if (activeTab === "quotations") {
    columns = ["Quotation No", "Client Company", "Sector", "Amount", "Status", "Deleted On", "Actions"];
    tableData = (data?.quotations || []).map((q: any) => ({
      ...q,
      "Quotation No": <span className="font-bold text-slate-800">{q.qtn_number || q.id}</span>,
      "Client Company": q.client_company || q.client_name || "-",
      "Sector": (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          (q.division?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {q.division || 'Contracting'}
        </span>
      ),
      "Amount": `QAR ${Number(q.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "Status": (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
          {q.status || "DRAFT"}
        </span>
      ),
      "Deleted On": q.deleted_at ? new Date(q.deleted_at).toLocaleString() : "-",
      "Actions": (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/quotation-details/${q.id}`}
            className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="View Quotation Receipt"
          >
            <Eye size={13} />
            View
          </Link>
          <button
            onClick={() => handleRestore("quotation", q.id)}
            disabled={restoreMutation.isPending}
            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Restore Quotation to active list"
          >
            <RotateCcw size={13} />
            Restore
          </button>
          <button
            onClick={() => openPermanentDeleteModal(
              "quotation",
              q.id,
              `Quotation ${q.qtn_number || q.id}`,
              "This will permanently erase this quotation and all its line items from the database. This action cannot be undone."
            )}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Permanently Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }));
  } else if (activeTab === "invoices") {
    columns = ["Invoice No", "Client Company", "Sector", "Amount", "Status", "Deleted On", "Actions"];
    tableData = (data?.invoices || []).map((inv: any) => ({
      ...inv,
      "Invoice No": <span className="font-bold text-slate-800">{inv.invoice_number || inv.invoiceNo}</span>,
      "Client Company": inv.client_company || inv.client_name || "-",
      "Sector": (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          (inv.division?.toLowerCase() === 'trading' || inv.branch?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {inv.division || inv.branch || 'Contracting'}
        </span>
      ),
      "Amount": `QAR ${Number(inv.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "Status": (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
          {inv.status || "SENT"}
        </span>
      ),
      "Deleted On": inv.deleted_at ? new Date(inv.deleted_at).toLocaleString() : "-",
      "Actions": (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/invoice-details/${inv.id}`}
            className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="View Invoice Details"
          >
            <Eye size={13} />
            View
          </Link>
          <button
            onClick={() => handleRestore("invoice", inv.id)}
            disabled={restoreMutation.isPending}
            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Restore Invoice to active list"
          >
            <RotateCcw size={13} />
            Restore
          </button>
          <button
            onClick={() => openPermanentDeleteModal(
              "invoice",
              inv.id,
              `Invoice ${inv.invoice_number || inv.id}`,
              "This will permanently erase this invoice, its line items, and payment logs from the database. This action cannot be undone."
            )}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Permanently Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }));
  } else if (activeTab === "deliveryNotes") {
    columns = ["DN Number", "Invoice No", "Client Company", "Sector", "Prepared By", "Deleted On", "Actions"];
    tableData = (data?.deliveryNotes || []).map((dn: any) => ({
      ...dn,
      "DN Number": <span className="font-bold text-emerald-700">{dn.delivery_note}</span>,
      "Invoice No": dn.invoice_number || "-",
      "Client Company": dn.client_company || dn.client_name || "-",
      "Sector": (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          (dn.division?.toLowerCase() === 'trading' || dn.branch?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {dn.division || dn.branch || 'Contracting'}
        </span>
      ),
      "Prepared By": dn.dn_prepared_by || "-",
      "Deleted On": dn.dn_deleted_at ? new Date(dn.dn_deleted_at).toLocaleString() : "-",
      "Actions": (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/delivery-note/${dn.id}`}
            className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="View Delivery Note"
          >
            <Eye size={13} />
            View
          </Link>
          <button
            onClick={() => handleRestore("delivery_note", dn.id)}
            disabled={restoreMutation.isPending}
            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Restore Delivery Note to Invoice"
          >
            <RotateCcw size={13} />
            Restore
          </button>
          <button
            onClick={() => openPermanentDeleteModal(
              "delivery_note",
              dn.id,
              `Delivery Note ${dn.delivery_note}`,
              `Permanently remove this delivery note data. The parent invoice ${dn.invoice_number} will remain safe and active.`
            )}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Permanently Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }));
  } else if (activeTab === "completionCertificates") {
    columns = ["Certificate No", "Invoice No", "Client Company", "Sector", "Deleted On", "Actions"];
    tableData = (data?.completionCertificates || []).map((coc: any) => ({
      ...coc,
      "Certificate No": <span className="font-bold text-purple-700">{coc.coc_number}</span>,
      "Invoice No": coc.invoice_number || "-",
      "Client Company": coc.client_company || coc.client_name || "-",
      "Sector": (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          (coc.division?.toLowerCase() === 'trading' || coc.branch?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {coc.division || coc.branch || 'Contracting'}
        </span>
      ),
      "Deleted On": coc.coc_deleted_at ? new Date(coc.coc_deleted_at).toLocaleString() : "-",
      "Actions": (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/completion-certificate/${coc.id}`}
            className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="View Completion Certificate"
          >
            <Eye size={13} />
            View
          </Link>
          <button
            onClick={() => handleRestore("completion_certificate", coc.id)}
            disabled={restoreMutation.isPending}
            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Restore Completion Certificate to Invoice"
          >
            <RotateCcw size={13} />
            Restore
          </button>
          <button
            onClick={() => openPermanentDeleteModal(
              "completion_certificate",
              coc.id,
              `Completion Certificate ${coc.coc_number}`,
              `Permanently remove this certificate data. The parent invoice ${coc.invoice_number} will remain safe and active.`
            )}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Permanently Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }));
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl shadow-md border flex items-center justify-between animate-in fade-in slide-in-from-top-3 ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-red-600" />}
            <span className="font-medium text-sm">{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <RotateCcw className="text-brand-600" size={26} />
              Recycle Bin & Restore
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Recover accidentally deleted quotations, invoices, delivery notes, and certificates, or permanently purge them.
            </p>
          </div>
        </div>

        {/* Global Stats Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-right">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total In Trash</span>
            <span className="text-lg font-bold text-slate-800">{counts.total} items</span>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("quotations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "quotations"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText size={16} />
          Quotations
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === "quotations" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {counts.quotations}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "invoices"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ScrollText size={16} />
          Invoices
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === "invoices" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {counts.invoices}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("deliveryNotes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "deliveryNotes"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Truck size={16} />
          Delivery Notes
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === "deliveryNotes" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {counts.deliveryNotes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completionCertificates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "completionCertificates"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Award size={16} />
          Completion Certificates
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === "completionCertificates" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {counts.completionCertificates}
          </span>
        </button>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-brand-600" size={32} />
            <p className="text-sm font-medium">Loading deleted items...</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-700">Trash is empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No deleted {activeTab.replace(/([A-Z])/g, " $1").toLowerCase()} found.
            </p>
          </div>
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
          />
        )}
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Permanent Delete</h3>
                <p className="text-xs text-red-600 font-medium">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-2 font-medium">
              Are you sure you want to permanently delete <strong className="text-slate-900">{confirmModal.title}</strong>?
            </p>
            <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={permanentDeleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => permanentDeleteMutation.mutate({ type: confirmModal.type, id: confirmModal.id })}
                disabled={permanentDeleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {permanentDeleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
