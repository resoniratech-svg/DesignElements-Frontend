import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import FormInput from "../../components/forms/FormInput";
import { financeService } from "../../services/financeService";
import type { Invoice } from "../../types/finance";

export default function EditDeliveryNote() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        deliveryNote: "",
        dnDate: new Date().toISOString().split("T")[0],
        dnPreparedBy: "",
        dnCheckedBy: "",
        dnReceiverName: ""
    });

    const { data: invoice, isLoading } = useQuery<Invoice>({
        queryKey: ["invoice", id],
        queryFn: () => financeService.getInvoice(id!),
        enabled: !!id
    });

    useEffect(() => {
        if (invoice) {
            const dataObj: any = (invoice as any).invoice || invoice;
            setForm({
                deliveryNote: dataObj.delivery_note || dataObj.deliveryNote || "",
                dnDate: dataObj.dn_date ? dataObj.dn_date.split('T')[0] : new Date().toISOString().split("T")[0],
                dnPreparedBy: dataObj.dn_prepared_by || dataObj.dnPreparedBy || "",
                dnCheckedBy: dataObj.dn_checked_by || dataObj.dnCheckedBy || "",
                dnReceiverName: dataObj.dn_receiver_name || dataObj.dnReceiverName || ""
            });
        }
    }, [invoice]);

    const mutation = useMutation({
        mutationFn: (data: Partial<Invoice>) => financeService.updateInvoice(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            navigate('/invoices');
        },
        onError: (error: any) => {
            alert(`Failed to save delivery note: ${error.message}`);
        }
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            delivery_note: form.deliveryNote,
            dn_date: form.dnDate,
            dn_prepared_by: form.dnPreparedBy,
            dn_checked_by: form.dnCheckedBy,
            dn_receiver_name: form.dnReceiverName
        };

        mutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-brand-600" />
                <p className="mt-4 text-slate-500">Loading invoice data...</p>
            </div>
        );
    }

    const dataObj: any = invoice ? ((invoice as any).invoice || invoice) : null;
    const items = (invoice as any)?.items || (invoice as any)?.invoice?.items || [];
    const clientName = dataObj?.client_name || dataObj?.client || "Unknown Client";
    const clientCompany = dataObj?.client_company || dataObj?.company_name || dataObj?.company || "";
    const invoiceNo = dataObj?.invoice_number || dataObj?.invoiceNo || "";
    const address = dataObj?.address || "Doha, Qatar";
    const tel = dataObj?.contact_number || dataObj?.tel || "";
    const displayDate = form.dnDate ? new Date(form.dnDate) : new Date();

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Delivery Note Setup</h1>
                        <p className="text-slate-500">For Invoice: {invoiceNo} ({clientName})</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* FORM SETUP */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="DN No." 
                            name="deliveryNote" 
                            value={form.deliveryNote} 
                            onChange={handleFormChange} 
                            placeholder="e.g. DETC/DN/AB/005/2026" 
                            required
                        />
                        <FormInput 
                            label="DN Date" 
                            type="date" 
                            name="dnDate" 
                            value={form.dnDate} 
                            onChange={handleFormChange} 
                            required
                        />
                        <FormInput 
                            label="Prepared By" 
                            name="dnPreparedBy" 
                            value={form.dnPreparedBy} 
                            onChange={handleFormChange} 
                            placeholder="e.g. Danish Babi" 
                        />
                        <FormInput 
                            label="Checked By" 
                            name="dnCheckedBy" 
                            value={form.dnCheckedBy} 
                            onChange={handleFormChange} 
                            placeholder="e.g. Athar Burhan" 
                        />
                        <FormInput 
                            label="Receiver's Name" 
                            name="dnReceiverName" 
                            value={form.dnReceiverName} 
                            onChange={handleFormChange} 
                            placeholder="Leave blank for manual signature, or pre-fill" 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-lg font-semibold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={mutation.isPending}
                            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                        </button>
                    </div>
                </form>

                {/* LIVE PREVIEW */}
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-700">Delivery Note Preview</h2>
                    <div className="bg-white font-serif text-black border border-slate-300 shadow-md relative flex flex-col p-8">
                        {/* Header Section */}
                        <div className="pb-4 flex justify-between items-center border-b pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Design Elements Logo" className="w-16 h-16 object-contain" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-700 uppercase tracking-wider">DESIGN ELEMENTS</span>
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">TRADING AND CONTRACTING W.L.L</span>
                                    <span className="text-[10px] text-gray-400 font-bold text-right mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                                </div>
                            </div>
                        </div>

                        {/* Title Box */}
                        <div className="border border-black mb-4 h-8 flex items-center justify-center">
                            <h1 className="font-bold tracking-widest text-[14px] uppercase underline decoration-2 underline-offset-4">DELIVERY NOTE</h1>
                        </div>

                        <div className="flex flex-col">
                            {/* Two Column Layout */}
                            <div className="flex justify-between gap-4 h-44">
                                {/* Left Column */}
                                <div className="w-1/2 flex flex-col justify-between">
                                    <div className="border border-black p-2 text-[11px] h-32 flex flex-col font-bold font-serif leading-tight">
                                        {clientCompany ? (
                                            <>
                                                <div className="uppercase mb-0.5">{clientCompany}</div>
                                                {clientName && (
                                                    <div className="text-[10px] text-gray-700 font-semibold mb-1">
                                                        Attn: <span className="uppercase">{clientName}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="uppercase mb-1">{clientName}</div>
                                        )}
                                        <div>{address}</div>
                                        {tel && <div className="mt-1">Contact: {tel}</div>}
                                    </div>
                                    
                                    <div className="border border-black p-2 text-[11px] font-bold flex items-center h-8 font-serif uppercase">
                                        ATTN: PROCUREMENT DEPARTMENT
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="w-1/2 flex flex-col justify-between">
                                    <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                        <tbody>
                                            <tr>
                                                <td className="border border-black p-1 pl-2 w-1/3">DN No:</td>
                                                <td className="border border-black p-1 text-center">{form.deliveryNote || "DETC/DN/..."}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-black p-1 pl-2">Order Number:</td>
                                                <td className="border border-black p-1 text-center">{dataObj?.lpo_no || dataObj?.reference_number || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-black p-1 pl-2">DATE :</td>
                                                <td className="border border-black p-1 text-center">
                                                    {displayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                        <tbody>
                                            <tr>
                                                <td className="border border-black p-1 pl-2 w-1/3">SALESMAN :</td>
                                                <td className="border border-black p-1 text-center">{dataObj?.salesman || "-"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Main Table */}
                            <table className="w-full border-collapse border border-black text-[11px] font-serif mt-4">
                                <thead>
                                    <tr className="font-bold bg-slate-50">
                                        <th className="border border-black p-1 w-[10%] text-center uppercase font-bold text-[10px]">SL. NO.</th>
                                        <th className="border border-black p-1 w-[50%] text-center uppercase font-bold text-[10px]">PART NUMBER, MAKE/BRAND</th>
                                        <th className="border border-black p-1 w-[20%] text-center uppercase font-bold text-[10px]">UOM</th>
                                        <th className="border border-black p-1 w-[20%] text-center uppercase font-bold text-[10px]">QUANTITY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any, idx: number) => (
                                        <tr key={idx} className="h-8 align-middle">
                                            <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                                            <td className="border border-black p-1 text-center font-bold">{item.description}</td>
                                            <td className="border border-black p-1 text-center font-bold">Nos</td>
                                            <td className="border border-black p-1 text-center font-bold">{item.quantity}</td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr className="h-12">
                                            <td colSpan={4} className="border border-black text-center text-slate-400 italic">No items recorded</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Signatures Area */}
                            <div className="mt-4 border border-black flex h-24 text-[10px] font-bold">
                                <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                                    <div>Prepared by: {form.dnPreparedBy || "-"}</div>
                                </div>
                                <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                                    <div>Checked By: {form.dnCheckedBy || "-"}</div>
                                </div>
                                <div className="w-1/3 p-2 flex flex-col justify-between">
                                    <div>Receiver's Name: <span className="font-normal">{form.dnReceiverName || "-"}</span></div>
                                    <div>Signature:</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
