import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { ArrowLeft, Loader2, FileText, Edit, Truck, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { financeService } from "../../services/financeService";
import { restoreService } from "../../services/restoreService";
import type { Invoice } from "../../types/finance";

export default function DeliveryNotes() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { activeDivision } = useDivision();
    const [statusFilter, setStatusFilter] = useState("all");
    const [displayLimit] = useState(1000);

    // Fetch invoices
    const { data: invoiceResponse, isLoading } = useQuery({
        queryKey: ["invoices", activeDivision, displayLimit],
        queryFn: () => financeService.getInvoices(activeDivision, 1, displayLimit),
        placeholderData: (previousData) => previousData
    });

    // Delete DN Mutation
    const deleteDNMutation = useMutation({
        mutationFn: (invoiceId: number) => restoreService.deleteDeliveryNote(invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["deletedItems"] });
        }
    });

    const handleDeleteDN = (invoiceId: number, dnNumber: string) => {
        if (window.confirm(`Move Delivery Note "${dnNumber}" to Recycle Bin? The parent invoice will remain safe.`)) {
            deleteDNMutation.mutate(invoiceId);
        }
    };

    const invoices = (invoiceResponse?.data || []) as Invoice[];

    // Calculate quick stats
    const totalCount = invoices.length;
    const generatedCount = invoices.filter(i => (i as any).delivery_note && (i as any).delivery_note.trim() !== "" && !(i as any).dn_deleted_at).length;
    const pendingCount = totalCount - generatedCount;

    // Filter based on DN status
    const filteredInvoices = invoices.filter((inv: any) => {
        const hasDN = inv.delivery_note && inv.delivery_note.trim() !== "" && !inv.dn_deleted_at;
        if (statusFilter === "generated") return hasDN;
        if (statusFilter === "pending") return !hasDN;
        return true;
    });

    const tableData = filteredInvoices.map((invoice: any) => {
        const clientName = invoice.client_name || invoice.client;
        const clientCompany = invoice.client_company || invoice.company_name || invoice.company;

        let clientDisplay = "-";
        if (clientCompany && clientName && clientCompany !== clientName) {
            clientDisplay = `${clientCompany} (${clientName})`;
        } else if (clientCompany) {
            clientDisplay = clientCompany;
        } else if (clientName) {
            clientDisplay = clientName;
        }

        const hasDN = invoice.delivery_note && invoice.delivery_note.trim() !== "" && !invoice.dn_deleted_at;

        return {
            ...invoice,
            "DN Number": (
                <span className={`font-semibold ${hasDN ? "text-brand-600 font-bold" : "text-slate-400 italic"}`}>
                    {hasDN ? invoice.delivery_note : "Pending Setup"}
                </span>
            ),
            "DN Date": invoice.dn_date ? invoice.dn_date.split("T")[0] : (invoice.invoice_date || invoice.date || "-"),
            "Invoice No": invoice.invoice_number || invoice.invoiceNo,
            "Client Company": clientDisplay,
            "Sector": (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    (invoice.division?.toLowerCase() === 'trading' || invoice.branch?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                }`}>
                    {invoice.division || invoice.branch || 'Contracting'}
                </span>
            ),
            "Prepared By": invoice.dn_prepared_by || invoice.salesman || "-",
            "Receiver Name": invoice.dn_receiver_name || "-",
            "Actions": (
                <div className="flex gap-1.5 items-center">
                    {hasDN ? (
                        <>
                            <Link
                                to={`/delivery-note/${invoice.id}`}
                                title="View / Print Delivery Note"
                                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                                <FileText size={12} />
                                View DN
                            </Link>
                            <Link
                                to={`/edit-delivery-note/${invoice.id}`}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit Delivery Note Setup"
                            >
                                <Edit size={14} />
                            </Link>
                            <button
                                onClick={() => handleDeleteDN(invoice.id, invoice.delivery_note)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Delivery Note"
                                disabled={deleteDNMutation.isPending}
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    ) : (
                        <Link
                            to={`/edit-delivery-note/${invoice.id}`}
                            className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 transition-colors"
                            title="Create Delivery Note Setup"
                        >
                            <Truck size={12} />
                            Create DN
                        </Link>
                    )}
                    <Link
                        to={`/invoice-details/${invoice.id}`}
                        title="View Linked Invoice"
                        className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors ml-1"
                    >
                        Invoice
                    </Link>
                </div>
            )
        };
    });

    const columns = [
        "DN Number",
        "DN Date",
        "Invoice No",
        "Client Company",
        "Sector",
        "Prepared By",
        "Receiver Name",
        "Actions"
    ];

    const currentDivision = DIVISIONS.find(d => d.id === activeDivision);
    const pageTitle = activeDivision === "all" ? "All Delivery Notes" : `${currentDivision?.label} Delivery Notes`;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Truck className="text-brand-600" size={26} />
                            {pageTitle}
                        </h1>
                        <p className="text-slate-500">Manage, generate, and track delivery notes for {currentDivision?.label || "all sectors"}</p>
                    </div>
                </div>
                <Link
                    to="/invoices"
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm text-sm font-medium"
                >
                    <FileText size={16} />
                    Go to Invoices
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                    onClick={() => setStatusFilter("all")}
                    className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-brand-500 border-brand-500" : "hover:border-slate-300"}`}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
                        <Truck size={18} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
                </div>
                <div 
                    onClick={() => setStatusFilter("generated")}
                    className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${statusFilter === "generated" ? "ring-2 ring-brand-500 border-brand-500" : "hover:border-slate-300"}`}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">DN Generated</span>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-700 mt-2">{generatedCount}</p>
                </div>
                <div 
                    onClick={() => setStatusFilter("pending")}
                    className={`p-4 rounded-xl border bg-white shadow-sm cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-brand-500 border-brand-500" : "hover:border-slate-300"}`}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Setup</span>
                        <Clock size={18} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-brand-600" />
                        <p className="text-sm font-medium">Loading delivery notes...</p>
                    </div>
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={tableData} 
                        extraFilters={
                            <select
                                className="bg-slate-50 border-none rounded-lg text-xs py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-brand-500 outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Delivery Notes ({totalCount})</option>
                                <option value="generated">Generated Only ({generatedCount})</option>
                                <option value="pending">Pending Setup ({pendingCount})</option>
                            </select>
                        }
                    />
                )}
            </div>
        </div>
    );
}
