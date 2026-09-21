import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { Plus, Trash2, Save, X } from "lucide-react";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import { useApprovals } from "../../context/ApprovalContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import type { DivisionId } from "../../constants/divisions";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import CompanyAutocomplete from "../../components/forms/CompanyAutocomplete";
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

    const [originalQuoteId, setOriginalQuoteId] = useState<string>("");
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [revisionChoice, setRevisionChoice] = useState<"keep" | "new">("keep");
    const [customRevisionId, setCustomRevisionId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [form, setForm] = useState({
        division: initialDivision,
        selectedFormat: initialFormat,
        project: "",
        company: "",
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

    useEffect(() => {
        if (!isPM && !isEditing && activeDivision !== "all") {
            const division = activeDivision.toUpperCase() as DivisionId;
            const format = "quotation1";
            const defaults = DEFAULTS[format as keyof typeof DEFAULTS];
            setForm(prev => ({
                ...prev,
                division,
                selectedFormat: format,
                company: "",
                client: "",
                customerCode: "",
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
                company: "",
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

    const formatNumberWithCommas = (val: string | number): string => {
        if (val === undefined || val === null) return "";
        const cleanStr = String(val).replace(/,/g, "").trim();
        if (cleanStr === "") return "";

        const parts = cleanStr.split(".");
        let integerPart = parts[0].replace(/\D/g, "");

        if (integerPart !== "") {
            integerPart = Number(integerPart).toLocaleString("en-US");
        } else if (parts.length > 1) {
            integerPart = "0";
        }

        if (parts.length > 1) {
            const decimalPart = parts.slice(1).join("").replace(/\D/g, "");
            return `${integerPart}.${decimalPart}`;
        }

        return integerPart;
    };

    const [items, setItems] = useState<QuotationItem[]>([
        { description: "", quantity: "1", unit: "Nos", unitPrice: "0", amount: 0, customSrNo: "01", itemCode: "", itemName: "", image: "" }
    ]);

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
            const loadedQtnNo = found.qtn_number || "";
            setOriginalQuoteId(loadedQtnNo);
            setForm(prev => ({
                ...prev,
                division: (found.division || "CONTRACTING") as DivisionId,
                project: found.project_name || found.project || "",
                company: found.client_company || found.company || "",
                client: found.client_name || found.client || "",
                customerCode: found.client_id?.toString() || "",
                quoteId: loadedQtnNo,
                status: found.status || found.Status || prev.status,
                date: new Date().toISOString().split('T')[0],

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
                setItems(found.items.map((it: any) => ({
                    ...it,
                    quantity: formatNumberWithCommas(it.quantity ?? it.qty ?? 1),
                    unitPrice: formatNumberWithCommas(it.unitPrice ?? it.unit_price ?? 0),
                    amount: ((parseFloat(String(it.quantity ?? it.qty ?? 1).replace(/,/g, '')) || 0) * (parseFloat(String(it.unitPrice ?? it.unit_price ?? 0).replace(/,/g, '')) || 0))
                })));
            }
        }
    }, [isEditing, existingQuotation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
        const newItems = [...items];
        let valToSet = value;
        if (field === 'quantity' || field === 'unitPrice') {
            valToSet = formatNumberWithCommas(value);
        }
        const updatedItem = { ...newItems[index], [field]: valToSet };

        // Recalculate item amount
        if (field === 'quantity' || field === 'unitPrice') {
            const q = parseFloat(String(updatedItem.quantity).replace(/,/g, '')) || 0;
            const p = parseFloat(String(updatedItem.unitPrice).replace(/,/g, '')) || 0;
            updatedItem.amount = q * p;
        }

        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const addItem = () => {
        const nextNum = (items.length + 1).toString().padStart(2, '0');
        setItems([...items, { description: "", quantity: "1", unit: "Nos", unitPrice: "0", amount: 0, customSrNo: nextNum, itemCode: "", itemName: "", image: "" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleCompanyChange = (companyName: string, clientId?: string, clientData?: any) => {
        if (!clientId) {
            setForm(prev => ({ ...prev, company: companyName }));
            return;
        }

        const clientDisplayName = clientData?.contactPerson && clientData.contactPerson !== "N/A" 
            ? clientData.contactPerson 
            : (clientData?.name || "");

        setForm(prev => ({
            ...prev,
            company: companyName,
            client: clientDisplayName || prev.client,
            customerCode: clientId,
            clientPhone: clientData?.phone && clientData.phone !== "N/A" ? clientData.phone : prev.clientPhone,
            clientEmail: clientData?.email && clientData.email !== "N/A" ? clientData.email : prev.clientEmail,
        }));
    };

    const handleClientChange = (name: string, clientId?: string, clientData?: any) => {
        if (!clientId) {
            setForm(prev => ({ ...prev, client: name, customerCode: "", clientPhone: "", clientEmail: "" }));
            return;
        }

        setForm(prev => ({
            ...prev,
            client: name,
            customerCode: clientId,
            company: clientData?.companyName || clientData?.name || prev.company,
            clientPhone: clientData?.phone && clientData.phone !== "N/A" ? clientData.phone : prev.clientPhone,
            clientEmail: clientData?.email && clientData.email !== "N/A" ? clientData.email : prev.clientEmail,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.quoteId?.trim()) {
            alert("Please enter a Quote ID.");
            return;
        }

        if (isEditing && editId) {
            // Check if user changed the quoteId directly in the input box
            if (form.quoteId.trim() !== originalQuoteId.trim()) {
                setRevisionChoice("new");
                setCustomRevisionId(form.quoteId.trim());
            } else {
                setRevisionChoice("keep");
                setCustomRevisionId("");
            }
            setIsUpdateModalOpen(true);
            return;
        }

        // New quotation creation
        await executeSave(form.quoteId.trim());
    };

    const handleConfirmSave = async () => {
        if (revisionChoice === "new") {
            const newId = customRevisionId.trim();
            if (!newId) {
                alert("Please enter a new Quote ID for the revision.");
                return;
            }
            if (newId === originalQuoteId.trim()) {
                alert("The new revision Quote ID must be different from the original Quote ID. Choose 'Keep Quote ID' to update directly.");
                return;
            }
            setIsUpdateModalOpen(false);
            await executeSave(newId);
        } else {
            setIsUpdateModalOpen(false);
            await executeSave(originalQuoteId || form.quoteId.trim());
        }
    };

    const executeSave = async (finalQuoteNumber: string) => {
        setIsSubmitting(true);
        // Calculate totals
        const calculatedItems = items.map(item => {
            const q = parseFloat(String(item.quantity).replace(/,/g, '')) || 0;
            const p = parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0;
            return {
                ...item,
                quantity: q,
                unitPrice: p,
                amount: q * p
            };
        });

        const totalAmount = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
        const netTotal = totalAmount * (1 - (parseFloat(String(form.discount)) || 0) / 100);
        const isApproved = user?.role === "SUPER_ADMIN";

        const submissionData: any = {
            qtn_number: finalQuoteNumber,
            client_id: Number(form.customerCode) || 0,
            division: form.division.toUpperCase(),
            total_amount: netTotal,
            discount: form.discount,
            status: form.status,
            items: calculatedItems,
            client_company: form.company,
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
                const res = await quotationService.updateQuotation(editId, submissionData);
                const newQtnNo = (res as any)?.qtn_number || (res as any)?.data?.qtn_number || finalQuoteNumber;
                const isRevision = finalQuoteNumber !== originalQuoteId;
                const activityMessage = isApproved
                    ? isRevision ? `Created Quotation Revision ${newQtnNo}` : `Updated Quotation ${newQtnNo}`
                    : isRevision ? `Created Quotation Revision ${newQtnNo} (Pending Approval)` : `Updated Quotation ${newQtnNo} (Pending Approval)`;
                logActivity(activityMessage, "project", "/quotations", newQtnNo);
            } else {
                const res = await quotationService.createQuotation(submissionData);
                const createdQtnNo = (res as any)?.qtn_number || (res as any)?.data?.qtn_number || finalQuoteNumber;

                // If not admin, request approval
                if (!isApproved) {
                    requestApproval({
                        type: "quotation",
                        itemId: createdQtnNo,
                        itemNumber: createdQtnNo,
                        division: form.division,
                        amount: netTotal,
                        notes: form.intro_text
                    });
                }

                logActivity(
                    isApproved
                        ? `Created Quotation ${createdQtnNo}`
                        : `Created Quotation ${createdQtnNo} (Pending Approval)`,
                    "project",
                    "/quotations",
                    createdQtnNo
                );
            }

            // Invalidate queries so that Quotations page and details reflect changes immediately
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            queryClient.invalidateQueries({ queryKey: ["quotation", editId] });

            navigate("/quotations");
        } catch (err: any) {
            console.error("Submission failed", err);
            const serverMessage = err.response?.data?.message || err.message;
            alert(`Failed to save quotation: ${serverMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    {/* <ArrowLeft size={20} /> */}
                </button>
                <PageHeader showBack title={isEditing ? "Edit Quotation" : "Create Quotation"} />
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-7xl mx-auto space-y-8">
                {/* Sector Selection (Visual Tiles) */}
                <DivisionTiles
                    label="Select Division / Sector"
                    selectedId={form.division}
                    onChange={handleDivisionChange}
                    allowedIds={allowedSectors}
                    showAll={false}
                    disabled={isEditing}
                />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quotation Format *</label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={form.selectedFormat}
                                    onChange={(e) => handleFormatChange(e.target.value)}
                                >
                                    <option value="quotation1">Quotation 1 (Standard)</option>
                                    <option value="quotation2">Quotation 2 (Service/Proposal)</option>
                                    <option value="quotation3">Quotation 3 (Detailed/Carpet)</option>
                                </select>
                            </div>
                            <FormInput
                                label="Quote ID *"
                                name="quoteId"
                                value={form.quoteId}
                                onChange={handleChange}
                                placeholder="Enter quote ID (e.g. TRD-QUO-001)"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormInput label="Date" type="date" name="date" value={form.date} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Company Selection</label>
                                <CompanyAutocomplete
                                    value={form.company}
                                    onChange={handleCompanyChange}
                                    division={form.division}
                                    placeholder="Search company..."
                                    disabled={isEditing}
                                />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-2 gap-6">
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
                                <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                    <div className="w-20 shrink-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sr. No</label>
                                        <input
                                            type="text"
                                            value={item.customSrNo}
                                            onChange={(e) => handleItemChange(index, "customSrNo", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-bold"
                                            placeholder="01"
                                        />
                                    </div>
                                    <div className="w-28 shrink-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Item Code</label>
                                        <input
                                            type="text"
                                            value={item.itemCode || item.item_code || ""}
                                            onChange={(e) => handleItemChange(index, "itemCode", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold"
                                            placeholder="e.g. ITM-001"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            {form.selectedFormat === 'quotation3' ? 'Particulars' : 'Description (Particulars)'}
                                        </label>
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                                            placeholder="Supply and installation of..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="w-28 shrink-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">QTY</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium"
                                            placeholder="1"
                                            required
                                        />
                                    </div>
                                    <div className="w-20 shrink-0">
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
                                    <div className="w-32 shrink-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="w-44 shrink-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</label>
                                        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-bold text-right text-sm overflow-x-auto whitespace-nowrap">
                                            {(((parseFloat(String(item.quantity).replace(/,/g, '')) || 0) * (parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="pt-6 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-colors"
                                            title="Remove item"
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
                                <span>{items.reduce((sum, item) => sum + ((parseFloat(String(item.quantity).replace(/,/g, '')) || 0) * (parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Discount (%)</span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    max="100"
                                    value={form.discount}
                                    onChange={(e) => setForm({ ...form, discount: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-md no-spinner"
                                />
                            </div>
                            <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t">
                                <span>Net Total</span>
                                <span>{(items.reduce((sum, item) => sum + ((parseFloat(String(item.quantity).replace(/,/g, '')) || 0) * (parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0)), 0) * (1 - (parseFloat(String(form.discount)) || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR</span>
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

            {/* Update Quotation Options Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
                                    📝
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Update Quotation Options</h3>
                                    <p className="text-xs text-slate-500">Current Quote ID: <span className="font-semibold text-slate-700">{originalQuoteId || form.quoteId}</span></p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="py-5 space-y-3">
                            <p className="text-sm text-slate-600">
                                How would you like to apply your changes to this quotation?
                            </p>

                            {/* Option 1: Keep Quote ID & Update In-Place */}
                            <div
                                onClick={() => setRevisionChoice("keep")}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    revisionChoice === "keep"
                                        ? "border-brand-500 bg-brand-50/40 shadow-sm"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="revisionChoice"
                                        checked={revisionChoice === "keep"}
                                        onChange={() => setRevisionChoice("keep")}
                                        className="mt-1 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                    <div>
                                        <div className="font-bold text-sm text-slate-800">
                                            Keep Quote ID ({originalQuoteId || form.quoteId}) & Update
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                            Directly updates this quotation in-place with your changes. No new revision row will be added.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Change Quote ID / Create New Revision */}
                            <div
                                onClick={() => setRevisionChoice("new")}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    revisionChoice === "new"
                                        ? "border-brand-500 bg-brand-50/40 shadow-sm"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="revisionChoice"
                                        checked={revisionChoice === "new"}
                                        onChange={() => setRevisionChoice("new")}
                                        className="mt-1 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-slate-800">
                                            Create New Revision (Change Quote ID)
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                            Keeps <span className="font-semibold text-slate-700">{originalQuoteId || form.quoteId}</span> in history and creates a new revision record with a custom Quote ID.
                                        </p>

                                        {revisionChoice === "new" && (
                                            <div className="mt-3 pt-3 border-t border-brand-100" onClick={e => e.stopPropagation()}>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Enter New Revision / Quote ID <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customRevisionId}
                                                    onChange={(e) => setCustomRevisionId(e.target.value)}
                                                    placeholder={`e.g. ${(originalQuoteId || form.quoteId)}.1 or ${(originalQuoteId || form.quoteId)}-REV1`}
                                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white font-medium shadow-inner"
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSave}
                                disabled={isSubmitting}
                                className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-200 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : revisionChoice === "new" ? "Create New Revision" : "Update Quotation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
