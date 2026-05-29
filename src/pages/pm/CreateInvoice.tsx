import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { Plus, Trash2, Save, Loader2, RefreshCw } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";
import { useApprovals } from "../../context/ApprovalContext";
import { useAuth } from "../../context/AuthContext";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import type { DivisionId } from "../../constants/divisions";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import { financeService } from "../../services/financeService";
import type { Invoice, InvoiceItem, InvoiceStatus } from "../../types/finance";

export default function CreateInvoice() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { logActivity } = useActivity();
    const { activeDivision } = useDivision();
    const { requestApproval } = useApprovals();
    const { user } = useAuth();
    const isEditing = !!id;

    const isPM = user?.role === "PROJECT_MANAGER";
    const userDivision = (user?.division || "CONTRACTING").toUpperCase() as DivisionId;

    const initialDivision = isPM ? userDivision : (activeDivision === "all" ? "CONTRACTING" : activeDivision.toUpperCase()) as DivisionId;

    const [form, setForm] = useState<Partial<Invoice>>({
        invoiceNo: "",
        client: "",
        clientId: "",
        customerCode: "",
        refType: "General",
        refNo: "",
        date: new Date().toISOString().split("T")[0],
        creditTerms: 0,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Unpaid" as InvoiceStatus,
        taxRate: 0,
        discount: 0,
        notes: "",
        paymentTerms: "Payable within 15 days",
        division: initialDivision,
        lpoNo: "",
        salesman: "",
        qid: "",
        address: "",
        advance: 0,
        invoiceType: "Credit" as "Credit" | "Cash",
        projectName: "",
        contactNumber: ""
    });

    const allowedSectors = useMemo(() => {
        return isPM && user?.division ? [user.division.toUpperCase()] : [];
    }, [isPM, user]);

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "default-item-1", description: "", quantity: 1, unitPrice: 0, amount: 0 }
    ]);

    // 1. Fetch invoice if editing
    const { data: invoice, isLoading: isFetching } = useQuery<Invoice>({
        queryKey: ["invoice", id],
        queryFn: () => financeService.getInvoice(id!),
        enabled: isEditing && !!id
    });

    // Sync form when data loads
    useEffect(() => {
        if (invoice) {
            const dataObj: any = (invoice as any).invoice || invoice;
            const itemsArr = (invoice as any).items || invoice.items || [];

            setForm({
                invoiceNo: dataObj.invoice_number || dataObj.invoiceNo || "",
                client: dataObj.client_name || dataObj.client || "",
                customerCode: dataObj.client_id || dataObj.clientId || "",
                refType: dataObj.ref_type || dataObj.refType || "General",
                refNo: dataObj.ref_no || dataObj.refNo || "",
                date: dataObj.invoice_date ? dataObj.invoice_date.split('T')[0] : (dataObj.date || new Date().toISOString().split("T")[0]),
                creditTerms: Number(dataObj.payment_terms) || 0,
                dueDate: dataObj.due_date ? dataObj.due_date.split('T')[0] : (dataObj.dueDate || ""),
                status: dataObj.status || "Unpaid",
                taxRate: Number(dataObj.tax_rate) || dataObj.taxRate || 0,
                discount: Number(dataObj.discount) || 0,
                notes: dataObj.notes || "",
                paymentTerms: dataObj.payment_terms || dataObj.paymentTerms || "Payable within 15 days",
                division: (dataObj.division || dataObj.branch) as DivisionId || "contracting",
                lpoNo: dataObj.lpo_no || dataObj.lpoNo || "",
                salesman: dataObj.salesman || "",
                qid: dataObj.qid || "",
                address: dataObj.address || "",
                advance: Number(dataObj.amount_paid) || dataObj.advance || dataObj.advancePaid || 0,
                invoiceType: dataObj.invoice_type || dataObj.invoiceType || "Credit",
                clientId: String(dataObj.client_id || dataObj.clientId || ""),
                contactNumber: dataObj.contact_number || dataObj.contactNumber || "",
                projectName: dataObj.project_name || dataObj.projectName || ""
            });

            const mappedItems = itemsArr.map((item: any, index: number) => ({
                id: item.id?.toString() || Date.now().toString() + index,
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.unit_price) || Number(item.unitPrice) || 0,
                amount: Number(item.total) || Number(item.amount) || 0
            }));

            setItems(mappedItems);
        }
    }, [invoice]);

    // Document number is now handled by the backend
    useEffect(() => {
        if (!isEditing) {
            setForm(prev => ({ ...prev, invoiceNo: "" }));
        }
    }, [form.division, isEditing]);

    // Auto-calculate Due Date
    useEffect(() => {
        if (form.date && (form.creditTerms ?? 0) >= 0) {
            const date = new Date(form.date);
            date.setDate(date.getDate() + (form.creditTerms ?? 0));
            setForm(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }));
        }
    }, [form.date, form.creditTerms]);

    const [totals, setTotals] = useState({
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        balance: 0
    });

    useEffect(() => {
        const subtotal = items.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        // Discount percentage calculation
        const discountAmount =
            subtotal * ((form.discount ?? 0) / 100);

        // Amount after discount
        const taxableAmount =
            subtotal - discountAmount;

        // Tax after discount
        const taxAmount =
            taxableAmount * ((form.taxRate ?? 0) / 100);

        // Final total
        const total =
            taxableAmount + taxAmount;

        // Remaining balance
        const balance =
            total - (form.advance || 0);

        setTotals({
            subtotal,
            taxAmount,
            total,
            balance
        });

    }, [items, form.taxRate, form.discount, form.advance]);
    // 2. Mutation for create/update
    const mutation = useMutation({
        mutationFn: (data: Partial<Invoice>) => isEditing ? financeService.updateInvoice(id!, data) : financeService.createInvoice(data),
        onSuccess: () => {
            const isApproved = user?.role === "SUPER_ADMIN";
            const activityMessage = isApproved
                ? `${isEditing ? "Updated" : "Created"} Invoice ${form.invoiceNo}`
                : `${isEditing ? "Updated" : "Created"} Invoice ${form.invoiceNo} (Pending Approval)`;

            logActivity(activityMessage, "finance", "/invoices", form.invoiceNo);
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            if (isEditing) queryClient.invalidateQueries({ queryKey: ["invoice", id] });
            navigate("/invoices");
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to ${isEditing ? 'update' : 'create'} invoice: ${serverMessage}`);
        }
    });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const name = e.target.name;
        const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;

        if (name === "status") {
            setForm(prev => {
                const nextForm = { ...prev, status: value as InvoiceStatus };
                if (value === "Unpaid") {
                    nextForm.advance = 0;
                } else if (value === "Due") {
                    if (prev.advance === totals.total || prev.status === "Paid") {
                        nextForm.advance = 0;
                    }
                } else if (value === "Paid") {
                    nextForm.advance = totals.total;
                }
                return nextForm;
            });
        } else if (name === "advance") {
            const adv = Number(value) || 0;
            setForm(prev => {
                const nextForm = { ...prev, advance: adv };
                if (adv >= totals.total) {
                    nextForm.status = "Paid";
                } else if (adv > 0) {
                    nextForm.status = "Due";
                } else {
                    nextForm.status = "Unpaid";
                }
                return nextForm;
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        if (field === "quantity" || field === "unitPrice") {
            item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        }
        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleDivisionChange = (
        newDivision: DivisionId | "all"
    ) => {

        const divisionToSet =
            newDivision === "all"
                ? "CONTRACTING"
                : newDivision;


        setForm(prev => ({
            ...prev,

            // UPDATE DIVISION
            division: divisionToSet,

            // UPDATE TAX
            taxRate: prev.taxRate,

            // RESET CLIENT DATA
            client: "",

            clientId: undefined,

            customerCode: "",

            // RESET CLIENT DETAILS
            contactNumber: "",

            address: "",

            qid: ""
        }));
    };

    const handleClientChange = (name: string, clientId?: string, clientData?: any) => {
        console.log("SELECTED CLIENT:", {
            clientId,
            clientData
        });
        setForm(prev => ({
            ...prev,
            client: name,
            clientId: clientData?.userId?.toString()
                || "",
            customerCode: clientId ? `CUST-${clientId}` : "",
            contactNumber: clientData?.phone && clientData.phone !== "N/A" ? clientData.phone : prev.contactNumber,
            address: clientData?.address && clientData.address !== "N/A" ? clientData.address : prev.address,
            qid: clientData?.qid && clientData.qid !== "N/A" ? clientData.qid : prev.qid
        }));

        if (!clientId && name.length > 0) {
            setForm(prev => ({ ...prev, customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}` }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.clientId) {
            alert("Please select a valid client from the dropdown list.");
            return;
        }

        if (!form.projectName?.trim()) {
            alert("Project Name is a mandatory field.");
            return;
        }

        if (items.length === 0 || !items.some(i => i.description.trim())) {
            alert("Please add at least one Product/Service item with a description.");
            return;
        }

        const isApproved = user?.role === "SUPER_ADMIN";
        let invoiceStatus: InvoiceStatus = form.status || "Unpaid";

        // Auto-update if balance is 0 and they didn't explicitly set it
        if (totals.balance <= 0 && invoiceStatus !== "Paid") {
            invoiceStatus = "Paid";
        }

        const invoiceData: any = {
            invoice_number: isEditing ? form.invoiceNo : "",
            division: form.division,
            client_id: form.clientId ? Number(form.clientId) : null,
            client_name: form.client,
            invoice_date: form.date,
            due_date: form.dueDate,
            subtotal: totals.subtotal,
            tax_rate: form.taxRate,
            tax_amount: totals.taxAmount,
            discount: form.discount,
            total_amount: totals.total,
            status: invoiceStatus,
            approval_status: (isApproved ? "approved" : "pending"),
            lpo_no: form.lpoNo,
            salesman: form.salesman,
            qid: form.qid,
            address: form.address,
            ref_type: form.refType,
            ref_no: form.refNo,
            project_name: form.projectName,
            notes: form.notes,
            payment_terms: String(form.creditTerms),
            contact_number: form.contactNumber,
            amount_paid: form.advance || 0,
            balance_amount: totals.balance,
            invoice_type: form.invoiceType || "Credit",
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                amount: item.amount
            }))
        };

        if (!isApproved && !isEditing) {
            requestApproval({
                type: "invoice",
                itemId: `inv-${Date.now()}`,
                itemNumber: form.invoiceNo!,
                division: form.division!,
                amount: totals.total,
                notes: form.notes
            });
        }

        mutation.mutate(invoiceData);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    {/* <ArrowLeft size={20} /> */}
                </button>
                <PageHeader showBack title={isEditing ? "Edit Invoice" : "Create New Invoice"} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm space-y-8">
                    {/* Sector Selection (Visual Tiles) */}
                    <DivisionTiles
                        label="Select Division / Sector"
                        selectedId={form.division!}
                        onChange={handleDivisionChange}
                        allowedIds={allowedSectors}
                        showAll={false}
                        disabled={isEditing}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                        <FormInput
                            label="Invoice No"
                            name="invoiceNo"
                            value={form.invoiceNo || "AUTO-GENERATED BY BACKEND"}
                            disabled
                            className={!form.invoiceNo ? "text-emerald-600 font-bold italic" : ""}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Payment Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleFormChange}
                                className="border p-2 rounded-lg bg-white"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Due">Due</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Client Selection *</label>
                            <div className="relative">
                                <ClientAutocomplete
                                    value={form.client!}
                                    onChange={handleClientChange}
                                    division={form.division!}
                                    placeholder="Search client..."
                                    disabled={isEditing}
                                />
                                {form.clientId ? (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                        <RefreshCw size={10} className="animate-pulse" /> Verified
                                    </div>
                                ) : form.client ? (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                                        Invalid
                                    </div>
                                ) : null}
                            </div>
                            {!form.clientId && form.client && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1">Please select a matching client from the list.</p>
                            )}
                        </div>

                        <FormInput
                            label="Customer Code"
                            name="customerCode"
                            value={form.customerCode!}
                            disabled
                            placeholder="Auto-generated"
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Ref Type</label>
                            <input
                                name="refType"
                                value={form.refType}
                                onChange={handleFormChange}
                                className="border p-2 rounded-lg"
                                placeholder="e.g. General, Proposal, Project"
                            />
                        </div>

                        <FormInput label="Ref Number" name="refNo" value={form.refNo} onChange={handleFormChange} placeholder="e.g. PROP-001" />

                        <FormInput label="Invoice Date" name="date" type="date" value={form.date} onChange={handleFormChange} />

                        <FormInput
                            label="Credit Terms (Days)"
                            name="creditTerms"
                            type="number"
                            value={form.creditTerms}
                            onChange={handleFormChange}
                            className="no-spinner"
                        />

                        <FormInput label="Due Date" name="dueDate" type="date" value={form.dueDate} disabled />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Invoice Type</label>
                            <select
                                name="invoiceType"
                                value={form.invoiceType}
                                onChange={handleFormChange}
                                className="border p-2 rounded-lg"
                            >
                                <option value="Credit">Credit</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        <FormInput label="LPO No." name="lpoNo" value={form.lpoNo} onChange={handleFormChange} placeholder="e.g. PO1031" />
                        <FormInput label="Salesman" name="salesman" value={form.salesman} onChange={handleFormChange} placeholder="Salesperson name" />
                        <FormInput label="QID" name="qid" value={form.qid} onChange={handleFormChange} placeholder="QID Number" />
                        <FormInput label="Project Name" name="projectName" value={form.projectName} onChange={handleFormChange} placeholder="Enter Project Name" required />
                        <FormInput label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleFormChange} placeholder="e.g. +974 5000 0000" />

                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleFormChange}
                                className="border p-2 rounded-lg h-11"
                                placeholder="Client address"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold">Invoice Items <span className="text-rose-500">*</span></h3>
                        <button type="button" onClick={addItem} className="text-brand-600 flex items-center gap-1 text-sm font-bold">
                            <Plus size={14} /> Add Item
                        </button>
                    </div>
                    <table className="w-full">
                        <thead className="text-left bg-slate-50 border-y">
                            <tr>
                                <th className="p-2">Description</th>
                                <th className="p-2 w-20 text-center">Qty</th>
                                <th className="p-2 w-32 text-right">Rate</th>
                                <th className="p-2 w-32 text-right">Amount</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2">
                                        <input className="w-full border-none focus:ring-0" placeholder="Item description" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} required />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" min="1" className="w-full border-none text-center focus:ring-0 no-spinner" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", parseInt(e.target.value))} required />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" min="0" className="w-full border-none text-right focus:ring-0 no-spinner" value={item.unitPrice} onChange={e => handleItemChange(idx, "unitPrice", parseFloat(e.target.value))} required />
                                    </td>
                                    <td className="p-2 text-right font-medium">QAR {item.amount.toLocaleString()}</td>
                                    <td className="p-2">
                                        <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No items added. Click "Add Item" to start.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="mt-6 flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>QAR {totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-slate-600">
                                <span>Tax (%)</span>
                                <input type="number" name="taxRate" value={form.taxRate} onChange={handleFormChange} className="w-20 text-right border rounded p-1 no-spinner" />
                            </div>
                            <div className="flex justify-between items-center gap-4 text-slate-600 border-b pb-2">
                                <span>Discount (%)</span>
                                <input type="number" name="discount" value={form.discount} onChange={handleFormChange} className="w-20 text-right border rounded p-1 no-spinner" />
                            </div>
                            <div className="flex justify-between text-lg font-bold text-brand-700">
                                <span>Total</span>
                                <span>QAR {totals.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-slate-600 border-t pt-2">
                                <span>Advance Paid</span>
                                <input type="number" name="advance" value={form.advance} onChange={handleFormChange} className="w-24 text-right border rounded p-1 font-bold text-brand-600 no-spinner" />
                            </div>
                            <div className="flex justify-between text-xl font-bold text-brand-800 border-t pt-2">
                                <span>Balance Payable</span>
                                <span>QAR {totals.balance?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate("/invoices")} className="px-6 py-2 border rounded-lg font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button
                        type="submit"
                        disabled={mutation.isPending || isFetching || !form.clientId}
                        className={`px-8 py-2 text-white rounded-lg flex items-center gap-2 transition shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${!form.clientId ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'
                            }`}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {isEditing ? "Updating..." : "Saving..."}
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {isEditing ? "Update Invoice" : "Create Invoice"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}





