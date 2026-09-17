import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import FormInput from "../../components/forms/FormInput";
import { financeService } from "../../services/financeService";
import type { Invoice } from "../../types/finance";

export default function EditCompletionCertificate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        cocNumber: "",
        cocDate: new Date().toISOString().split("T")[0],
        cocStartDate: "",
        cocCompletionDate: "",
        cocProduct: "",
        cocRemarks: "",
        cocHasNoRemarks: true
    });

    const { data: invoice, isLoading } = useQuery<Invoice>({
        queryKey: ["invoice", id],
        queryFn: () => financeService.getInvoice(id!),
        enabled: !!id
    });

    useEffect(() => {
        if (invoice) {
            const dataObj: any = (invoice as any).invoice || invoice;
            const items = (invoice as any)?.items || (invoice as any)?.invoice?.items || [];
            const productSummary = items.map((it: any) => it.description).filter(Boolean).join(", ");
            const year = new Date().getFullYear();
            const cleanInvNo = (dataObj.invoice_number || dataObj.invoiceNo || id || "").replace(/[^a-zA-Z0-9]/g, "").slice(-4);
            const defaultCertNo = `DETC-${cleanInvNo || "001"}-${year}`;

            setForm({
                cocNumber: dataObj.coc_number || defaultCertNo,
                cocDate: dataObj.coc_date ? dataObj.coc_date.split('T')[0] : (dataObj.invoice_date ? dataObj.invoice_date.split('T')[0] : new Date().toISOString().split("T")[0]),
                cocStartDate: dataObj.coc_start_date ? dataObj.coc_start_date.split('T')[0] : "",
                cocCompletionDate: dataObj.coc_completion_date ? dataObj.coc_completion_date.split('T')[0] : (dataObj.invoice_date ? dataObj.invoice_date.split('T')[0] : ""),
                cocProduct: dataObj.coc_product || productSummary || "Supply and Installation Works",
                cocRemarks: dataObj.coc_remarks || "",
                cocHasNoRemarks: dataObj.coc_has_no_remarks !== undefined ? dataObj.coc_has_no_remarks : true
            });
        }
    }, [invoice, id]);

    const mutation = useMutation({
        mutationFn: (data: Partial<Invoice>) => financeService.updateInvoice(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoice", id] });
            navigate(`/completion-certificate/${id}`, { replace: true });
        },
        onError: (error: any) => {
            alert(`Failed to save certificate: ${error.message}`);
        }
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            coc_number: form.cocNumber,
            coc_date: form.cocDate,
            coc_start_date: form.cocStartDate,
            coc_completion_date: form.cocCompletionDate,
            coc_product: form.cocProduct,
            coc_remarks: form.cocRemarks,
            coc_has_no_remarks: form.cocHasNoRemarks
        };

        mutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-brand-600" />
                <p className="mt-4 text-slate-500">Loading certificate data...</p>
            </div>
        );
    }

    const dataObj: any = invoice ? ((invoice as any).invoice || invoice) : null;
    const clientName = dataObj?.client_name || dataObj?.client || "Unknown Client";
    const clientCompany = dataObj?.client_company || dataObj?.company_name || dataObj?.company || clientName;
    const invoiceNo = dataObj?.invoice_number || dataObj?.invoiceNo || "";
    const projectName = dataObj?.project_name || dataObj?.projectName || "-";
    const poNo = dataObj?.lpo_no || dataObj?.reference_number || "-";
    const dnNo = dataObj?.delivery_note || "-";

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-white rounded-full transition-colors" title="Back to Invoices">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Certificate of Completion Setup</h1>
                        <p className="text-slate-500">For Invoice: {invoiceNo} ({clientCompany})</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/completion-certificate/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition shadow-sm"
                >
                    <Eye size={16} />
                    View Certificate
                </button>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* FORM SETUP */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Certificate No." 
                            name="cocNumber" 
                            value={form.cocNumber} 
                            onChange={handleFormChange} 
                            placeholder="e.g. DETC-001-2026" 
                            required
                        />
                        <FormInput 
                            label="Certificate Date" 
                            type="date" 
                            name="cocDate" 
                            value={form.cocDate} 
                            onChange={handleFormChange} 
                            required
                        />
                        <FormInput 
                            label="Installation Start Date" 
                            type="date" 
                            name="cocStartDate" 
                            value={form.cocStartDate} 
                            onChange={handleFormChange} 
                        />
                        <FormInput 
                            label="Installation Completion Date" 
                            type="date" 
                            name="cocCompletionDate" 
                            value={form.cocCompletionDate} 
                            onChange={handleFormChange} 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product / Scope of Work</label>
                        <textarea
                            name="cocProduct"
                            value={form.cocProduct}
                            onChange={handleFormChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                            placeholder="Describe supply, installation, or material scope..."
                        />
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Outstanding Items / Remarks</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.cocHasNoRemarks}
                                    onChange={(e) => setForm({ ...form, cocHasNoRemarks: e.target.checked })}
                                    className="rounded border-slate-400 text-brand-600 focus:ring-0"
                                />
                                None
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                <input
                                    type="checkbox"
                                    checked={!form.cocHasNoRemarks}
                                    onChange={(e) => setForm({ ...form, cocHasNoRemarks: !e.target.checked })}
                                    className="rounded border-slate-400 text-brand-600 focus:ring-0"
                                />
                                Details
                            </label>
                        </div>

                        {!form.cocHasNoRemarks && (
                            <FormInput
                                label="Details of Remarks / Observations"
                                name="cocRemarks"
                                value={form.cocRemarks}
                                onChange={handleFormChange}
                                placeholder="Enter any minor observations or pending touch-ups..."
                            />
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button type="button" onClick={() => navigate('/invoices')} className="px-6 py-2 border rounded-lg font-semibold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={mutation.isPending}
                            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save & View Certificate
                        </button>
                    </div>
                </form>

                {/* LIVE PREVIEW */}
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-700">Certificate Preview</h2>
                    <div className="bg-white font-serif text-black border border-slate-300 shadow-md relative flex flex-col p-8 pt-0">
                        {/* Decorative Top Bar */}
                        <div className="h-4 bg-gray-200 w-full flex justify-end -mx-8 mb-6" style={{ width: "calc(100% + 4rem)" }}>
                            <div className="w-1/4 h-full bg-gray-600 transform skew-x-12 origin-top-right"></div>
                        </div>

                        {/* Header Section */}
                        <div className="pb-4 flex justify-between items-center border-b pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Design Elements Logo" className="w-16 h-16 object-contain" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-700 uppercase tracking-wider">DESIGN ELEMENTS</span>
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">TRADING AND CONTRACTING W.L.L</span>
                                    <span className="text-[10px] text-gray-400 font-bold mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                                </div>
                            </div>
                        </div>

                        {/* Title Box */}
                        <div className="text-center mb-6">
                            <h1 className="text-lg font-bold tracking-wider uppercase border-b-2 border-black inline-block px-8 pb-1">
                                CERTIFICATE OF COMPLETION
                            </h1>
                        </div>

                        {/* Certificate Meta */}
                        <div className="text-[12px] font-sans space-y-1 mb-4">
                            <div><span className="font-bold">Certificate No. : </span>{form.cocNumber || "DETC-001-2026"}</div>
                            <div><span className="font-bold">Date : </span>{form.cocDate || new Date().toISOString().split("T")[0]}</div>
                        </div>

                        {/* Project Details */}
                        <div className="mb-4">
                            <h3 className="font-bold text-[11px] uppercase tracking-wider mb-2 text-slate-700">PROJECT DETAILS</h3>
                            <div className="text-[12px] font-sans space-y-1.5 border-b pb-4">
                                <div><span className="font-medium text-slate-600">Company Name: </span><span className="font-bold">{clientCompany}</span></div>
                                <div><span className="font-medium text-slate-600">Project Name: </span><span className="font-bold">{projectName}</span></div>
                                <div><span className="font-medium text-slate-600">Product: </span><span className="font-bold">{form.cocProduct}</span></div>
                                <div><span className="font-medium text-slate-600">PO No.: </span><span className="font-bold">{poNo}</span></div>
                                <div><span className="font-medium text-slate-600">DN No.: </span><span className="font-bold">{dnNo}</span></div>
                            </div>
                        </div>

                        {/* Installation Dates */}
                        <div className="text-[12px] font-sans space-y-1 mb-4">
                            <div><span className="font-medium text-slate-600">Installation Start Date: </span><span className="font-bold">{form.cocStartDate || "N/A"}</span></div>
                            <div><span className="font-medium text-slate-600">Installation Completion Date: </span><span className="font-bold">{form.cocCompletionDate || "N/A"}</span></div>
                        </div>

                        {/* Declaration */}
                        <div className="text-[11px] font-sans space-y-2 mb-4 bg-slate-50 p-3 rounded border">
                            <p className="font-bold uppercase text-[10px] text-slate-600">COMPLETION & INSPECTION</p>
                            <p className="text-slate-700">The above-mentioned installation works have been completed and inspected by the concerned parties.</p>
                            <p className="text-slate-700">Upon inspection, the works have been found to be completed in accordance with the agreed requirements.</p>
                        </div>

                        {/* Standard Footer */}
                        <div className="mt-8 text-center font-bold font-serif text-[10px] pt-4 pb-2 bg-white w-full border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2">
                                <span>OCR No: 211686</span>
                                <span>•</span>
                                <span>+974 5023 4242</span>
                                <span>•</span>
                                <span>Doha - Qatar</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="bg-gray-400 text-white rounded-full w-[14px] h-[14px] flex items-center justify-center text-[9px]">@</span>
                                <span>info@designelementsqatar.com</span>
                                <span className="mx-2 font-black text-gray-400">•</span>
                                <span>www.designelementsqatar.com</span>
                            </div>
                        </div>

                        {/* Decorative Bottom Bar */}
                        <div className="h-4 bg-gray-200 w-full flex justify-start -mx-8 -mb-8 mt-2" style={{ width: "calc(100% + 4rem)" }}>
                            <div className="w-1/4 h-full bg-gray-600 transform -skew-x-12 origin-top-left"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                * {
                    font-variant-numeric: lining-nums tabular-nums;
                }
                .font-serif {
                    font-family: "Times New Roman", Times, Cambria, serif !important;
                    font-variant-numeric: lining-nums tabular-nums !important;
                }
            `}</style>
        </div>
    );
}
