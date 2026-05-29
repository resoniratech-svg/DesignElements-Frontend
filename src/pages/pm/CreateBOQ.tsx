import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { boqService } from "../../services/boqService";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import DivisionTiles from "../../components/forms/DivisionTiles";
import type { DivisionId } from "../../constants/divisions";
import { Plus, Trash2 } from "lucide-react";

interface BOQItem {
    id?: number;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
}

export default function CreateBOQ() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isPM = user?.role === "PROJECT_MANAGER";
    const userDivision = (user?.division || "CONTRACTING").toUpperCase();

    const [selectedSector, setSelectedSector] = useState<string>(
        isPM ? userDivision : "TRADING"
    );

    const allowedSectors = useMemo(() => {
        return isPM && user?.division ? [user.division.toUpperCase()] : [];
    }, [isPM, user]);

    const [items, setItems] = useState<BOQItem[]>([
        {
            description: "",
            quantity: 1,
            unit: "pcs",
            rate: 0,
            amount: 0
        }
    ]);

    const [form, setForm] = useState({
        project: "",
        client_name: "",
        client_id: "",
        sector: isPM ? userDivision : "TRADING",
        status: "UNPAID",
        totalAmount: "0",
        date: new Date().toISOString().split('T')[0]
    });

    // Fetch existing BOQ if editing
    const { data: existingBOQResponse } = useQuery({
        queryKey: ["boq", id],
        queryFn: () => boqService.getBOQById(id!),
        enabled: isEdit
    });

    useEffect(() => {
        if (isEdit && existingBOQResponse?.data) {
            const boq = existingBOQResponse.data;
            
            let loadedStatus = (boq.status || boq.Status || "UNPAID").toUpperCase();
            if (loadedStatus === "PENDING") loadedStatus = "UNPAID";
            if (loadedStatus === "PARTIAL") loadedStatus = "DUE";

            setForm({
                project: boq.project_name || "",
                client_name: boq.client_name || "",
                client_id: boq.client_id?.toString() || "",
                sector: boq.sector?.toUpperCase() || "TRADING",
                status: loadedStatus,
                totalAmount: boq.total_amount?.toString() || "0",
                date: boq.date
                    ? new Date(boq.date)
                        .toISOString()
                        .split('T')[0]
                    : new Date()
                        .toISOString()
                        .split('T')[0]
            });
            setItems(boq.items || []);
            if (boq.sector) {
                setSelectedSector(
                    boq.sector.toUpperCase()
                );
            }
        }
    }, [isEdit, existingBOQResponse]);

    const handleClientChange = (clientName: string, clientId?: string, clientData?: any) => {
        setForm(prev => ({
            ...prev,
            client_id: clientId || "",
            client_name: clientData ? (clientData.contactPerson && clientData.contactPerson !== "N/A" ? `${clientData.contactPerson} (${clientData.name})` : clientData.name) : clientName
        }));
    };

    const handleSectorChange = (id: DivisionId | "all") => {
        const sectorToSet = id === "all"
            ? "TRADING"
            : id.toUpperCase();

        setSelectedSector(sectorToSet);

        setForm(prev => ({
            ...prev,
            sector: sectorToSet,
            client_id: "",
            client_name: ""
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateItem = (index: number, field: keyof BOQItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        if (field === "quantity" || field === "rate") {
            item.amount = Number(item.quantity) * Number(item.rate);
        }
        newItems[index] = item;
        setItems(newItems);

        // Update total header amount based on items sum
        const total = newItems.reduce((sum, i) => sum + i.amount, 0);
        setForm(prev => ({ ...prev, totalAmount: total.toString() }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Form Validation
        if (!form.client_name.trim() || !form.client_id) {
            alert("Please select a valid Client from the dropdown list.");
            return;
        }
        if (!form.project.trim()) {
            alert("Project Name is a mandatory field.");
            return;
        }
        if (items.length === 0 || !items[0].description.trim()) {
            alert("Please add at least one line item with a description.");
            return;
        }

        const payload = {
            project_name: form.project,
            client_name: form.client_name,
            client_id: form.client_id ? parseInt(form.client_id) : null,
            status: form.status,
            total_amount: parseFloat(form.totalAmount) || 0,
            date: form.date,
            sector: form.sector,
            items: items
        };

        console.log("SAVING PAYLOAD:", payload);

        try {
            if (isEdit) {
                await boqService.updateBOQ(id!, payload);
                queryClient.invalidateQueries({ queryKey: ["boq", id] });
            } else {
                console.log("[DEBUG] Creating BOQ with payload:", payload);
                await boqService.createBOQ({ ...payload, boq_number: "" });
            }
            queryClient.invalidateQueries({ queryKey: ["boqs"] });
            navigate("/boq");
        } catch (err: any) {
            console.error("Failed to save BOQ:", err);
            const errMsg = err.response?.data?.message || err.message || "Unknown error";
            alert(`Error saving BOQ: ${errMsg}`);
        }
    };

    return (
        <div className="p-6">
            <PageHeader showBack
                title={isEdit ? "Edit BOQ" : "Create BOQ"}
                subtitle={isEdit ? "Update details for an existing Bill of Quantities" : "Generate a new Bill of Quantities for a project"}
            />

            <div className="bg-white p-6 rounded-xl border shadow-sm max-w-4xl mt-6">

                <div className="mb-8 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <DivisionTiles
                        label="Select Project Sector"
                        selectedId={selectedSector}
                        onChange={handleSectorChange}
                        allowedIds={allowedSectors}
                        showAll={false}
                        disabled={isEdit}
                    />
                </div>


                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-2 md:col-span-1">
                        <FormInput
                            label="Project Name"
                            name="project"
                            value={form.project}
                            placeholder="e.g. Al Rayyan Mall Fit-out"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Client Name *</label>
                        <ClientAutocomplete
                            value={form.client_name}
                            onChange={handleClientChange}
                            division={selectedSector}
                            placeholder="Choose a Client..."
                            disabled={isEdit}
                        />
                    </div>



                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-brand-500 hover:border-slate-300 transition-all outline-none font-medium text-slate-700 shadow-sm"
                        >
                            <option value="DUE">Due</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <FormInput
                            label="Project Date"
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Line Items Section */}
                    <div className="col-span-2 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Line Items</h3>
                            <button
                                type="button"
                                onClick={() => setItems([...items, { description: "", quantity: 1, unit: "pcs", rate: 0, amount: 0 }])}
                                className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 text-sm bg-brand-50 px-3 py-1.5 rounded-lg transition-colors border border-brand-100"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto border rounded-xl bg-slate-50/30">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-100/50 border-b">
                                        <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Description</th>
                                        <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-widest text-[10px] w-24">Qty</th>
                                        <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-widest text-[10px] w-24">Unit</th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-600 uppercase tracking-widest text-[10px] w-32">Rate</th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-600 uppercase tracking-widest text-[10px] w-32">Amount</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2">
                                                <input
                                                    className="w-full border-none focus:ring-0 text-sm font-medium bg-transparent"
                                                    value={item.description}
                                                    placeholder="Item name..."
                                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-none focus:ring-0 text-center text-sm bg-transparent no-spinner"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    className="w-full border-none focus:ring-0 text-center text-sm bg-transparent"
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-none focus:ring-0 text-right text-sm bg-transparent no-spinner"
                                                    value={item.rate}
                                                    onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 text-right font-bold text-slate-800">
                                                QAR {item.amount.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">No items added yet. Click "Add Item" to start.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-span-2 mt-6">
                        <div className="max-w-sm ml-auto">
                            <FormInput
                                label="Total Amount (QAR)"
                                name="totalAmount"
                                type="number"
                                value={form.totalAmount}
                                placeholder="0.00"
                                onChange={handleChange}
                                className="no-spinner font-bold"
                            />
                        </div>
                    </div>


                    <div className="col-span-2 mt-4 flex justify-end">
                        <button
                            type="submit"
                            className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
                        >
                            {isEdit ? "Update BOQ Profile" : "Save BOQ Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}