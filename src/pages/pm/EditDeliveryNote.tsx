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
    const clientName = dataObj?.client_name || dataObj?.client || "Unknown Client";
    const invoiceNo = dataObj?.invoice_number || dataObj?.invoiceNo || "";

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Delivery Note Setup</h1>
                        <p className="text-slate-500">For Invoice: {invoiceNo} ({clientName})</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl bg-white p-6 rounded-lg border shadow-sm space-y-6">
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
        </div>
    );
}
