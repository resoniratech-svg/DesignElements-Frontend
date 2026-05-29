import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { Plus, Trash2, Save, Camera } from "lucide-react";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import { useApprovals } from "../../context/ApprovalContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import type { DivisionId } from "../../constants/divisions";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationService } from "../../services/quotationService";
import type { QuotationItem } from "../../types/pm";

export default function CreateQuotation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const params = useParams();
    const editId = params.id;
    const isEditing = !!editId;
    const { activeDivision } = useDivision();
    const { requestApproval } = useApprovals();
    const { user } = useAuth();
    const { logActivity } = useActivity();

    const isPM = user?.role === "PROJECT_MANAGER";
    const userDivision = (user?.division || "CONTRACTING").toUpperCase() as DivisionId;

    const DEFAULTS = {
        quotation1: {
            aboutUs: "",
            whatWeDo: "",
            proposalIntro: "With reference to the above-mentioned subject and your inquiry, please find below our final rock bottom prices: -",
            financialTerms: "",
            clientDuties: "",
            paymentTerms: "",
            attn: "",
            attn_designation: "",
            salutation: "Dear Sir/Madam,",
            reference_no: "",
            intro_text: "On behalf of M/s Design Elements Trading and Contracting and in relation to the above project, we are pleased to provide you our best offer for the required work, as per the details provided by you.",
            tc_terms: "1. Prices offered are on Supply & Installation.\n2. Goods delivered shall remain property of Design Elements Trading & Contracting till the payment are made in full and final.",
            tc_payment: "1. As agreed.",
            tc_delivery: "1. 2 weeks for delivery and installation.",
            tc_installation: "",
            tc_validity: "1. This Quotation is valid for Thirty (90) days.",
            outro_text: "On behalf of all Design Elements Trading and Contracting, thank you for your enquiry. We hope our offer meets your project requirements. Looking forward to hearing from you soon to work on this prestigious project.",
            salesman: "Athar Burhan",
            salesman_designation: "Business Development Manager",
            salesman_phone: "+974 5023 4242",
            salesman_email: "ab@designelementsqatar.com"
        },
        quotation2: {
            aboutUs: "Design Elements is a trusted provider of comprehensive corporate and industrial setup solutions in Qatar. We specialize in guiding investors and entrepreneurs through every stage of company formation, licensing, and operational setup, ensuring compliance with all local laws and regulations. Our expertise extends to supporting industrial projects with end-to-end documentation, approvals, and advisory services.",
            whatWeDo: "Company formation and trade license registration\nIndustrial license applications and approvals\nGovernment liaison and PRO services\nSpecial approval coordination for industrial projects\nComprehensive project documentation and compliance",
            proposalIntro: "On behalf of M/s Design Elements Trading & Contracting in relation to the above project, we are pleased to provide you our best offer for the required work, as per the details provided by you.",
            financialTerms: "Total Package Cost: QAR 11,000 (all-inclusive)\n\nThis charge includes:\n• Trade name registration\n• Commercial Registration (CR) issuance\n• Trade licence registration\n• All documentation and necessary approvals for company setup\n• Establishment ID issuance\n• Tax registration\n• Ministry of Labour (MOL) registration\n• Ministry of Interior (MOI) update\n\nNote: This activity is subject to obtaining prior approval from the Ministry of Culture – Department of Press and Publication for registration of press and publishing activities. This charge excludes all deposits and other government related charges.",
            clientDuties: "1. Provide required documents for CR approval (QID, Passport, Police Clearance, National Address, Mobile/Email)\n2. Provide office/building space documents for trade licence registration\n3. Responsible for providing and paying all bank-related deposits, requirements, and charges\n4. Submit signatures and info in a timely manner\n5. Arrange and cover all office-related services and costs\n6. Attend any ministry or authority appointments\n7. Ensure accuracy of all submitted documents",
            paymentTerms: "1. 100% Advance Payment",
            attn: "",
            attn_designation: "",
            salutation: "Dear Sir/Madam,",
            reference_no: "",
            intro_text: "On behalf of M/s Design Elements Trading & Contracting in relation to the above project, we are pleased to provide you our best offer for the required work, as per the details provided by you.",
            tc_terms: "1. Prices offered are on Installation basis.\n2. One-two days advance notification is required for the mobilization of the team in the site for installation.\n3. Forklift / Lift facilities to be provided at the site by the main contractor to unload and shifting of materials on the floors.\n4. Protection of installed material shall be under client’s responsibility.\n5. Water and electricity should be provided near the working area.\n6. Material and accessories shall be provided by client, all necessary tools and equipment’s related to installation shall be provided by us.",
            tc_payment: "1. 100% Advance Payment",
            tc_delivery: "1. 2-3 days from the date of PO and receiving of advance payment.",
            tc_installation: "",
            tc_validity: "1. This Quotation is valid for Thirty (30) days.",
            outro_text: "On behalf of all Design Elements Trading and Contracting, thank you for your enquiry. We hope our offer meets your project requirements. Looking forward to hearing from you soon to work on this prestigious project.",
            salesman: "Athar Burhan",
            salesman_designation: "Business Development Manager",
            salesman_phone: "+974 5023 4242",
            salesman_email: "ab@designelementsqatar.com"
        },
        quotation3: {
            aboutUs: "",
            whatWeDo: "",
            proposalIntro: "On behalf of M/s Design Elements Trading and Contracting LLC and in relation to the above project, we are pleased to provide you our best offer for the Supply & Installation of Carpet, as per the specifications provided with the details below.",
            financialTerms: "",
            clientDuties: "",
            paymentTerms: "1. 50% advance payment upon receipt of the purchase order.\n2. 30% against the Bill of Lading (B/L) copy prior to delivery of material.\n3. 20% upon final completion of the work.",
            attn: "",
            attn_designation: "",
            salutation: "Dear Sir/Madam,",
            reference_no: "",
            intro_text: "On behalf of M/s Design Elements Trading and Contracting LLC and in relation to the above project, we are pleased to provide you our best offer for the Supply & Installation of Carpet, as per the specifications provided with the details below.",
            tc_terms: "1. Prices offered are on Removal of Existing Carpet, Supply and Installation new Carpet with Underlay.\n2. Clear access and continuous work front should be available in the site.\n3. Gate passes if any, should be provided for access by the main contractor & all the cost of the same shall be borne by the main contractor.\n4. Any other scope not mentioned in our quotation will be treated as variation.\n5. Goods delivered shall remain property of Subcontractor till the payment are made in full and final.\n6. Protection of delivered material shall be under client’s responsibility.\n7. Water and electricity should be provided near the working area.\n8. Installation to be done as glue down method.",
            tc_payment: "1. 50% advance payment upon receipt of the purchase order.\n2. 30% against the Bill of Lading (B/L) copy prior to delivery of material.\n3. 20% upon final completion of the work.",
            tc_delivery: "Production lead time is 4 weeks from the date of receiving the advance payment. Sea transit (LCL shipment) will take approximately 4-5 weeks.",
            tc_installation: "2-3 Weeks",
            tc_validity: "1. This Quotation is valid for 60 days.",
            outro_text: "On behalf of all Design Elements Trading and Contracting, thank you for your enquiry. We hope to serve you and look forward to hearing from you soon about working on this prestigious project.",
            salesman: "Athar Burhan",
            salesman_designation: "Business Development Manager",
            salesman_phone: "+974 5023 4242",
            salesman_email: "ab@designelementsqatar.com"
        }
    };

    const initialDivision = isPM ? userDivision : (activeDivision === "all" ? "CONTRACTING" : activeDivision.toUpperCase()) as DivisionId;
    const initialFormat = "quotation1";
    const initialDefaults = DEFAULTS[initialFormat as keyof typeof DEFAULTS];

    const [form, setForm] = useState({
        division: initialDivision,
        selectedFormat: initialFormat,
        project: "",
        client: "",
        customerCode: "",
        quoteId: "",
        status: "PENDING_APPROVAL",
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        clientPhone: "",
        clientEmail: "",
        ...initialDefaults
    });

    const allowedSectors = useMemo(() => {
        return isPM && user?.division ? [user.division.toUpperCase()] : [];
    }, [isPM, user]);

    // Document number is now handled by the backend
    useEffect(() => {
        if (!isEditing) {
            setForm(prev => ({ ...prev, quoteId: "" }));
        }
    }, [form.division, isEditing]);

    useEffect(() => {
        if (!isPM && !isEditing && activeDivision !== "all") {
            const division = activeDivision.toUpperCase() as DivisionId;
            const format = "quotation1";
            const defaults = DEFAULTS[format as keyof typeof DEFAULTS];
            setForm(prev => ({
                ...prev,
                division,
                selectedFormat: format,
                ...defaults
            }));
        }
    }, [activeDivision, isPM, isEditing]);

    // Handle division change in creation mode
    const handleDivisionChange = (newDivision: DivisionId | "all") => {
        const divisionToSet = (newDivision === "all" ? "CONTRACTING" : newDivision) as DivisionId;
        if (!isEditing) {
            const format = "quotation1";
            const defaults = DEFAULTS[format as keyof typeof DEFAULTS];
            setForm(prev => ({
                ...prev,
                division: divisionToSet,
                selectedFormat: format,
                client: "",
                customerCode: "",
                ...defaults
            }));
        } else {
            setForm(prev => ({ ...prev, division: divisionToSet }));
        }
    };

    // Handle format change
    const handleFormatChange = (format: string) => {
        const defaults = DEFAULTS[format as keyof typeof DEFAULTS];
        setForm(prev => ({
            ...prev,
            selectedFormat: format,
            ...defaults
        }));
    };

    const [items, setItems] = useState<QuotationItem[]>([
        { description: "", quantity: 1, unit: "Nos", unitPrice: 0, amount: 0, customSrNo: "01", image: "" }
    ]);

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleItemChange(index, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch existing quotation from database if editing
    const { data: existingQuotation } = useQuery({
        queryKey: ["quotation", editId],
        queryFn: () => quotationService.getQuotation(editId!),
        enabled: isEditing && !!editId
    });

    useEffect(() => {
        if (isEditing && existingQuotation) {
            const found = existingQuotation;
            console.log("EDIT QUOTATION DATA:", found);
            setForm(prev => ({
                ...prev,
                division: (found.division || "CONTRACTING") as DivisionId,
                project: found.project_name || found.project || "",
                client: found.client_name || found.client || "",
                customerCode: found.client_id?.toString() || "",
                quoteId: found.qtn_number || "",
                status: found.status || found.Status || prev.status,
                date: found.created_at
                    ? found.created_at.split(/[T ]/)[0]
                    : new Date()
                        .toISOString()
                        .split('T')[0],

                discount:
                    found.discount !== undefined &&
                        found.discount !== null
                        ? Number(found.discount)
                        : prev.discount,
                aboutUs: found.aboutUs || prev.aboutUs,
                whatWeDo: found.whatWeDo || prev.whatWeDo,
                proposalIntro: found.proposalIntro || prev.proposalIntro,
                financialTerms: found.financialTerms || prev.financialTerms,
                clientDuties: found.clientDuties || prev.clientDuties,
                paymentTerms: found.paymentTerms || prev.paymentTerms,
                attn: found.attn || prev.attn,
                attn_designation: found.attn_designation || prev.attn_designation,
                salutation: found.salutation || prev.salutation,
                reference_no: found.reference_no || prev.reference_no,
                intro_text: found.intro_text || prev.intro_text,
                tc_terms: found.tc_terms || prev.tc_terms,
                tc_payment: found.tc_payment || prev.tc_payment,
                tc_delivery: found.tc_delivery || prev.tc_delivery,
                tc_validity: found.tc_validity || prev.tc_validity,
                outro_text: found.outro_text || prev.outro_text,
                salesman: found.salesman || prev.salesman,
                salesman_designation: found.salesman_designation || prev.salesman_designation,
                salesman_phone: found.salesman_phone || prev.salesman_phone,
                salesman_email: found.salesman_email || prev.salesman_email,
                clientPhone: found.client_phone || prev.clientPhone,
                clientEmail: found.client_email || prev.clientEmail,
                selectedFormat: found.selected_format || "quotation1",
            }));

            if (found.items && found.items.length > 0) {
                setItems(found.items);
            }
        }
    }, [isEditing, existingQuotation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
        const newItems = [...items];
        const updatedItem = { ...newItems[index], [field]: value };

        // Recalculate item amount
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }

        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const addItem = () => {
        const nextNum = (items.length + 1).toString().padStart(2, '0');
        setItems([...items, { description: "", quantity: 1, unit: "Nos", unitPrice: 0, amount: 0, customSrNo: nextNum, image: "" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleClientChange = async (name: string, clientId?: string) => {
        if (!clientId) {
            setForm({ ...form, client: name, customerCode: "", clientPhone: "", clientEmail: "" });
            return;
        }

        setForm({ ...form, client: name, customerCode: clientId });

        try {
            const { clientService } = await import("../../services/clientService");
            const details = await clientService.getClient(clientId);
            if (details) {
                setForm(prev => ({
                    ...prev,
                    clientPhone: details.phone || "",
                    clientEmail: details.email || ""
                }));
            }
        } catch (err) {
            console.error("Error fetching client details:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate totals
        const calculatedItems = items.map(item => ({
            ...item,
            amount: Number(item.quantity) * Number(item.unitPrice)
        }));

        const totalAmount = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
        const netTotal = totalAmount * (1 - Number(form.discount) / 100);
        const isApproved = user?.role === "SUPER_ADMIN";

        const submissionData: any = {
            qtn_number: isEditing ? form.quoteId : "",
            client_id: Number(form.customerCode) || 0,
            division: form.division.toUpperCase(),
            total_amount: netTotal,
            discount: form.discount,
            status: form.status,
            items: calculatedItems,
            client_name: form.client,
            project_name: form.project,
            valid_until: new Date(new Date(form.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            terms: form.tc_terms || "",
            attn: form.attn,
            attn_designation: form.attn_designation,
            salutation: form.salutation,
            reference_no: form.reference_no,
            intro_text: form.intro_text,
            tc_terms: form.tc_terms,
            tc_payment: form.tc_payment,
            tc_delivery: form.tc_delivery,
            tc_validity: form.tc_validity,
            outro_text: form.outro_text,
            salesman: form.salesman,
            salesman_designation: form.salesman_designation,
            salesman_phone: form.salesman_phone,
            salesman_email: form.salesman_email,
            client_phone: form.clientPhone,
            client_email: form.clientEmail,
            selected_format: form.selectedFormat,
            tc_installation: form.tc_installation,
            created_at: form.date
        };

        try {
            if (isEditing && editId) {
                await quotationService.updateQuotation(editId, submissionData);
            } else {
                await quotationService.createQuotation(submissionData);

                // If not admin, request approval
                if (!isApproved) {
                    requestApproval({
                        type: "quotation",
                        itemId: form.quoteId,
                        itemNumber: form.quoteId,
                        division: form.division,
                        amount: netTotal,
                        notes: form.intro_text
                    });
                }
            }

            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            if (isEditing && editId) {
                queryClient.invalidateQueries({ queryKey: ["quotation", editId] });
            }

            const activityMessage = isApproved
                ? `${isEditing ? "Updated" : "Created"} Quotation ${form.quoteId}`
                : `${isEditing ? "Updated" : "Created"} Quotation ${form.quoteId} (Pending Approval)`;

            logActivity(activityMessage, "project", "/quotations", form.quoteId);
            navigate(`/quotations`);
        } catch (err: any) {
            console.error("ERROR SAVING QUOTATION:", err);
            const errorMsg = err.response?.data?.message || "Failed to save quotation to database.";
            alert(`${errorMsg}\nPlease ensure you have selected a valid client from the dropdown.`);
        }
    };

    return (
        <div className="p-6">
            <PageHeader showBack
                title={isEditing ? "Edit Quotation" : "Create Quotation"}
                subtitle="Generate a detailed cost estimate for Business, Contracting or Trading"
            />

            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm max-w-5xl mt-6">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Sector Selection (Visual Tiles) */}
                    <DivisionTiles
                        label="Select Division / Sector"
                        selectedId={form.division}
                        onChange={handleDivisionChange}
                        allowedIds={allowedSectors}
                        showAll={false}
                        disabled={isEditing}
                    />

                    {/* Header Details */}
                    <div className="pt-6 border-t border-slate-50 space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quotation Format *</label>
                                <select
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={form.selectedFormat}
                                    onChange={(e) => handleFormatChange(e.target.value)}
                                >
                                    <option value="quotation1">Quotation 1 (Standard)</option>
                                    <option value="quotation2">Quotation 2 (Service/Proposal)</option>
                                    <option value="quotation3">Quotation 3 (Detailed/Carpet)</option>
                                </select>
                            </div>
                            <FormInput
                                label="Quote ID"
                                name="quoteId"
                                value={form.quoteId || "AUTO-GENERATED BY BACKEND"}
                                disabled
                                className={!form.quoteId ? "text-emerald-600 font-bold italic" : ""}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Date" type="date" name="date" value={form.date} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Client Selection *</label>
                                <ClientAutocomplete
                                    value={form.client}
                                    onChange={handleClientChange}
                                    division={form.division}
                                    placeholder="Search client..."
                                    disabled={isEditing}
                                />
                            </div>
                            <FormInput
                                label="Customer Code"
                                value={form.customerCode}
                                disabled
                                placeholder="Auto-generated"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormInput
                                label="Client Contact Number"
                                name="clientPhone"
                                value={form.clientPhone}
                                onChange={handleChange}
                                placeholder="e.g. +974 1234 5678"
                            />
                            <FormInput
                                label="Client Email Address"
                                name="clientEmail"
                                value={form.clientEmail}
                                onChange={handleChange}
                                placeholder="e.g. client@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Project Name" name="project" value={form.project} placeholder="e.g. Katara Towers - Insurance" onChange={handleChange} required />
                            <FormInput label="Reference" name="reference_no" value={form.reference_no} placeholder="e.g. Raffles Guest room" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Attention & Salutation */}
                    <div className="pt-6 border-t border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Attention & Salutation</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Attn Name" name="attn" value={form.attn} placeholder="e.g. Mohammed Rameez" onChange={handleChange} />
                            <FormInput label="Attn Designation" name="attn_designation" value={form.attn_designation} placeholder="e.g. PURCHASING BUYER" onChange={handleChange} />
                            <FormInput label="Salutation" name="salutation" value={form.salutation} placeholder="e.g. Dear Rameez," onChange={handleChange} />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <div className="flex justify-between items-end mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-slate-800">Products / Services</h3>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sr. No</label>
                                        <input
                                            type="text"
                                            value={item.customSrNo}
                                            onChange={(e) => handleItemChange(index, "customSrNo", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-bold"
                                            placeholder="01"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description (Particulars)</label>
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                                            placeholder="Supply and installation of..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    {form.selectedFormat === 'quotation3' && (
                                        <div className="w-32">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ref Photo</label>
                                            <div className="flex flex-col gap-2">
                                                {item.image ? (
                                                    <div className="relative group">
                                                        <img src={item.image} alt="Ref" className="w-full h-16 object-cover rounded border border-slate-200" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleItemChange(index, 'image', '')}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full h-16 bg-white border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50">
                                                        <Camera size={16} className="text-slate-400" />
                                                        <span className="text-[10px] text-slate-500 mt-1">Upload</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(index, e)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">QTY</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md no-spinner"
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
                                        <input
                                            type="text"
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                                            placeholder="e.g. m2"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md no-spinner"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</label>
                                        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-medium text-right">
                                            {(item.quantity * item.unitPrice).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals & Discount */}
                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Subtotal</span>
                                <span>{items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Discount (%)</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.discount}
                                    onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-md no-spinner"
                                />
                            </div>
                            <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t">
                                <span>Net Total</span>
                                <span>{(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * (1 - form.discount / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Quotation Content Customization */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-800 border-b-2 border-brand-500 pb-2">Quotation Content (Customizable)</h3>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Introduction Text</label>
                            <textarea
                                name="intro_text"
                                value={form.intro_text}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">1. Terms & Conditions</label>
                                <textarea
                                    name="tc_terms"
                                    value={form.tc_terms}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">2. Payment Terms</label>
                                <textarea
                                    name="tc_payment"
                                    value={form.tc_payment}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">3. Delivery & Storage</label>
                                <textarea
                                    name="tc_delivery"
                                    value={form.tc_delivery}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Installation</label>
                                <textarea
                                    name="tc_installation"
                                    value={form.tc_installation}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Validity</label>
                                <textarea
                                    name="tc_validity"
                                    value={form.tc_validity}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Closing / Outro Text</label>
                            <textarea
                                name="outro_text"
                                value={form.outro_text}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Salesman Details */}
                    <div className="pt-6 border-t border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Salesman Details (For Sign-off)</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Salesman Name" name="salesman" value={form.salesman} onChange={handleChange} />
                            <FormInput label="Salesman Designation" name="salesman_designation" value={form.salesman_designation} onChange={handleChange} />
                            <FormInput label="Salesman Phone" name="salesman_phone" value={form.salesman_phone} onChange={handleChange} />
                            <FormInput label="Salesman Email" name="salesman_email" value={form.salesman_email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Old Proposal fields (Hidden or kept as extra) */}


                    <div className="pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 font-bold"
                        >
                            <Save size={18} />
                            {editId ? "Update Quotation" : "Generate Quotation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
