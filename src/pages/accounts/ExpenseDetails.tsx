import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, CreditCard, FileText, Paperclip, ExternalLink, PieChart, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "../../services/financeService";
import { getUploadUrl } from "../../services/api";

// Removed unused Expense import

export default function ExpenseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showImage, setShowImage] = useState(false);

    const { data: dbExpense, isLoading, isError } = useQuery({
        queryKey: ["expense", id],
        queryFn: () => financeService.getExpense(id!),
        enabled: !!id
    });

    if (isLoading) return <div className="p-6 text-center text-slate-500">Loading expense details...</div>;
    if (isError || !dbExpense) return <div className="p-6 text-center text-slate-500">Expense not found.</div>;

    const expense = {
        id: dbExpense.id,
        createdAt: dbExpense.created_at,
        amount: dbExpense.total_amount,
        expenseName: dbExpense.description,
        date: dbExpense.date ? dbExpense.date.split(/[T ]/)[0] : "-",
        category: dbExpense.category,
        paymentMethod: dbExpense.payment_method || "Transfer",
        vendor: dbExpense.vendor || "Internal",
        notes: dbExpense.notes || "",
        attachment: dbExpense.attachment || null,
        approvalStatus: dbExpense.approval_status?.toLowerCase() === "pending_approval" ? "pending" : dbExpense.approval_status?.toLowerCase(),
        allocationType: dbExpense.allocation_type,
        allocations: dbExpense.allocations?.reduce((acc: any, curr: any) => {
             acc[curr.division] = curr.percentage;
             return acc;
        }, {}) || {},
        divisionLabel: dbExpense.allocations && dbExpense.allocations.length === 1 ? dbExpense.allocations[0].division : (dbExpense.allocation_type || "N/A"),
        referenceType: dbExpense.expense_type,
        description: dbExpense.description // Added for compatibility
    };

    const isSmartAllocation = expense.allocationType === "SMART";

    const divisionLabel = isSmartAllocation 
        ? "Multi-Division (Smart Allocation)"
        : (expense.divisionLabel ||
        (expense.referenceType === "contracting"
            ? "Contracting Services"
            : expense.referenceType === "trading"
                ? "Trading Services"
                : expense.referenceType === "business"
                    ? "Business Proposal Services"
                    : "General Expense"));

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Top Bar */}
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Expense Details</h1>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{expense.id}</span>
                             <span className="text-[10px] text-slate-400 font-medium">• Recorded at {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Amount Card */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group">
                        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-8 text-white relative">
                            <div className="relative z-10">
                                <p className="text-xs opacity-80 font-bold uppercase tracking-widest mb-2">Total Amount</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold opacity-80">QAR</span>
                                    <h2 className="text-5xl font-black tracking-tighter">
                                        {Number(expense.amount || 0).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </h2>
                                </div>
                                <p className="text-lg mt-4 font-semibold text-brand-50">{expense.expenseName || expense.description}</p>
                            </div>
                            <CreditCard size={120} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        {/* Detailed Information */}
                        <div className="p-8">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailRow icon={<Calendar size={20} className="text-blue-500"/>} label="Expense Date" value={expense.date || "-"} color="blue" />
                                <DetailRow icon={<Tag size={20} className="text-emerald-500" />} label="Category" value={expense.category || "-"} color="emerald" />
                                <DetailRow icon={<CreditCard size={20} className="text-amber-500" />} label="Payment Method" value={expense.paymentMethod || "-"} color="amber" />
                                <DetailRow icon={<FileText size={20} className="text-indigo-500" />} label="Vendor / Payee" value={expense.vendor || "-"} color="indigo" />
                            </div>
                        </div>
                    </div>

                    {/* Allocation Details Section */}
                    {isSmartAllocation && (
                         <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <PieChart size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Distribution Breakdown</h3>
                                    <p className="text-[10px] text-slate-500">How this expense is distributed across divisions.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(expense.allocations || {}).map(([division, percentValue]) => {
                                    const percent = percentValue as number;
                                    const amount = (Number(expense.amount || 0) * (percent / 100));
                                    if (percent === 0) return null;
                                    return (
                                        <div key={division} className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{division}</span>
                                                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded italic">{percent}%</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">QAR {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                                <div 
                                                    className="h-full bg-brand-500 rounded-full transition-all duration-1000 group-hover:bg-brand-600 shadow-sm" 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                    )}

                    {/* Notes Section */}
                    {expense.notes && (
                        <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText size={16} />
                                    Internal Notes
                                </h3>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{expense.notes}</p>
                            </div>
                            <FileText size={80} className="absolute -bottom-4 -right-4 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Attachment Card */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Attachment</h3>
                        {expense.attachment ? (
                            <div className="space-y-4">
                                <div 
                                    onClick={() => setShowImage(true)}
                                    className="aspect-[3/4] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                                >
                                    <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/10 transition-colors z-10" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20 scale-90 group-hover:scale-100">
                                        <div className="bg-white p-3 rounded-full shadow-lg">
                                            <ExternalLink size={20} className="text-brand-600" />
                                        </div>
                                    </div>
                                    {/* Placeholder for actual image viewing since we use dummy local storage names */}
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <Paperclip size={40} className="opacity-40" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{expense.attachment.split('.').pop()} FILE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                                    <Paperclip size={18} className="text-brand-600 shrink-0" />
                                    <span className="text-[11px] font-bold text-brand-700 truncate">
                                        {expense.attachment.split('/').pop()}
                                    </span>
                                </div>
                                <a 
                                    href={getUploadUrl(expense.attachment)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={14} /> Open Document
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-xl opacity-50">
                                <Paperclip size={32} className="text-slate-300 mb-2" />
                                <span className="text-xs text-slate-400 font-medium italic">No attachments</span>
                            </div>
                        )}
                    </div>

                    {/* Summary Info Card */}
                    <div className="bg-slate-900 rounded-lg p-6 text-white">
                        <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6">Status Info</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white/60 uppercase">Approval Status</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${expense.approvalStatus === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {expense.approvalStatus || 'approved'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white/60 uppercase">Linked Sector</span>
                                <span className="text-[10px] font-black uppercase text-brand-400">{divisionLabel.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal (Dummy Simulation) */}
            {showImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300"
                    onClick={() => setShowImage(false)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                    <div className="max-w-4xl max-h-full bg-slate-800 rounded-lg border border-white/10 flex flex-col items-center justify-center p-20 gap-8">
                         <Paperclip size={120} className="text-white/20" />
                         <div className="text-center space-y-2">
                             <h4 className="text-2xl font-black text-white tracking-tight">{expense.attachment.split('/').pop()}</h4>
                             <p className="text-white/40 font-medium">Document attached to {expense.id}</p>
                         </div>
                         <a 
                            href={getUploadUrl(expense.attachment)} 
                            download 
                            className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-brand-50 transition-all active:scale-95"
                         >
                             Download Original File
                         </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };

    return (
        <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                {icon}
            </div>
            <div className="flex flex-col justify-center h-12">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{value}</p>
            </div>
        </div>
    );
}
