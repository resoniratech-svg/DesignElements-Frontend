import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { Plus, Trash2, Save, ArrowLeft, FileEdit } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";
import type { Proposal, ProposalActivity } from "../../types/pm";

const SectionCard = ({ title, children, number }: { title: string, children: React.ReactNode, number: string }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-700 text-sm w-6 h-6 flex items-center justify-center rounded-full font-black">{number}</span>
            {title}
        </h3>
        {children}
    </div>
);

export default function CreateProposal() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { logActivity } = useActivity();
    const isEditing = !!id;

    const defaultAboutText = "Design Elements is a trusted provider of comprehensive corporate and industrial setup solutions in Qatar . We specialize in guiding investors and entrepreneurs through every stage of company formation, licensing, and operational setup, ensuring compliance with all local laws and regulations. Our expertise extends to supporting industrial projects with end-to-end documentation, approvals, and advisory services.";
    const defaultServices = [
        "Company formation and trade license registration",
        "Industrial license applications and approvals",
        "Government liaison and PRO services",
        "Special approval coordination for industrial projects",
        "Comprehensive project documentation and compliance"
    ];
    const defaultProposalDesc = "Design Elements proposes to manage the complete setup of a new company in Qatar.\nThe company's commercial activities will be as follows:";
    const defaultPaymentTerms = "50% advance payment upon acceptance of this proposal.\nRemaining 50% payable upon completion and signing of company formation documentation.\nPayments can be made by invoice and shall follow the agreed project milestones.\nPrices are subject to revision in case of changes to client requirements or government fee structures\nAll APPROVAL and other government approval fees, if applicable, shall be paid directly by the client.";
    const defaultClientDuties = "Provide the required documents for CR approval, including:\nQatar ID copy of each partner/shareholder - if available\nPassport copy of each partner/shareholder\nPolice clearance certificate from mother country\nNational address\nPersonal email and mobile number\nCompany email and mobile number (if available)\nProvide the required office/building space documents for trade licence registration (after CR approval).\nThe client shall be responsible for providing and paying all bank-related deposits, requirements, and charges as applicable.\nSubmit all necessary documents, signatures, and information in a timely manner, including any Police Clearance Certificate (PCC) if required.\nThe client shall be solely responsible for arranging and covering all office-related services and associated costs provide a Power of Attorney (POA) in the name of the designated PRO for the process if required by authorities.\nAttend any ministry or authority appointments when necessary.\nEnsure the accuracy of all submitted documents and respond promptly to Design Elements’ requests to avoid delays.";


    const [form, setForm] = useState<Omit<Proposal, 'services' | 'activities'>>({
        id: "", // Will be set on save if empty
        proposalNo: `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Draft",

        // SECTION 1: Cover Page
        preparedFor: "",
        clientName: "",
        year: new Date().getFullYear().toString(),
        title: "Business Proposal",

        // SECTION 2: About Company
        aboutCompany: defaultAboutText,

        // SECTION 4: Our Proposal
        proposalDescription: defaultProposalDesc,

        // SECTION 6: Financial & Commercial Terms
        packageName: "",
        totalPackageCost: 0,
        includedServices: "",
        exclusions: "",
        financialNotes: "",

        // SECTION 7: Client Duties
        clientDuties: defaultClientDuties,

        // SECTION 8: Payment Terms
        paymentTerms: defaultPaymentTerms,
    });

    // SECTION 3: Services Provided
    const [services, setServices] = useState<string[]>(defaultServices);

    // SECTION 5: Activities
    const [activities, setActivities] = useState<ProposalActivity[]>([
        { id: "1", title: "", description: "" }
    ]);

    useEffect(() => {
        if (isEditing) {
            const persistedProposals: Proposal[] = JSON.parse(localStorage.getItem("trek_proposals") || "[]");
            const proposal = persistedProposals.find((p) => p.id === id);
            if (proposal) {
                const { services: pServices, activities: pActivities, ...rest } = proposal;
                setForm(rest);
                if (pServices) setServices(pServices);
                if (pActivities) setActivities(pActivities);
            }
        }
    }, [id, isEditing]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
        const name = e.target.name;
        setForm({ ...form, [name]: value });
    };

    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...services];
        newServices[index] = value;
        setServices(newServices);
    };

    const addService = () => setServices([...services, ""]);
    const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));

    const handleActivityChange = (index: number, field: keyof ProposalActivity, value: string) => {
        const newActivities = [...activities];
        newActivities[index] = { ...newActivities[index], [field]: value };
        setActivities(newActivities);
    };

    const addActivity = () => setActivities([...activities, { id: Date.now().toString(), title: "", description: "" }]);
    const removeActivity = (index: number) => setActivities(activities.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();
        const finalStatus = (isDraft ? "Draft" : form.status) as Proposal['status'];

        const proposalData: Proposal = {
            ...form,
            status: finalStatus,
            id: isEditing ? (id || "") : `prop-${Date.now()}`,
            services,
            activities,
            amount: form.totalPackageCost, // For list view backward compatibility
            client: form.clientName,       // For list view backward compatibility
            date: new Date().toISOString().split("T")[0]
        };

        const existingProposals: Proposal[] = JSON.parse(localStorage.getItem("trek_proposals") || "[]");
        let updatedProposals: Proposal[];

        if (isEditing) {
            updatedProposals = existingProposals.map((p) => p.id === id ? proposalData : p);
        } else {
            updatedProposals = [...existingProposals, proposalData];
        }

        localStorage.setItem("trek_proposals", JSON.stringify(updatedProposals));
        logActivity(`${isEditing ? "Updated" : "Created"} Proposal ${form.proposalNo}`, "role", "/proposals", form.proposalNo);
        navigate(isDraft ? "/draft-proposals" : "/proposals");
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-24">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <PageHeader showBack
                        title={isEditing ? "Edit Business Proposal" : "Create Business Proposal"}
                        subtitle="Build a comprehensive proposal structure"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-slate-600">Status:</label>
                    <select name="status" value={form.status} onChange={handleFormChange} className="border px-3 py-1.5 rounded-lg bg-white font-medium">
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* --- TEMPLATES SECTION --- */}


            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">

                <SectionCard number="1" title="Cover Page">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Prepared For" name="preparedFor" value={form.preparedFor} onChange={handleFormChange} placeholder="e.g. Mr. ANWAR" required />
                        <FormInput label="Client Company Name" name="clientName" value={form.clientName} onChange={handleFormChange} required />
                        <FormInput label="Year" name="year" value={form.year} onChange={handleFormChange} required />
                        <FormInput label="Proposal Title" name="title" value={form.title} onChange={handleFormChange} required />
                        <FormInput label="Proposal ID (Auto)" name="proposalNo" value={form.proposalNo} disabled />
                    </div>
                </SectionCard>

                <SectionCard number="2" title="About Company">
                    <p className="text-xs text-slate-500 mb-2 font-medium">This text is pre-filled but can be edited if needed.</p>
                    <textarea
                        name="aboutCompany"
                        value={form.aboutCompany}
                        onChange={handleFormChange}
                        rows={5}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                    />
                </SectionCard>

                <SectionCard number="3" title="Services Provided (What We Do)">
                    <div className="space-y-3">
                        {services.map((service, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={service}
                                    onChange={(e) => handleServiceChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
                                    placeholder="Service description"
                                />
                                <button type="button" onClick={() => removeService(index)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addService} className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800 mt-2">
                            <Plus size={16} /> Add Another Service
                        </button>
                    </div>
                </SectionCard>

                <SectionCard number="4" title="Our Proposal">
                    <textarea
                        name="proposalDescription"
                        value={form.proposalDescription}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                </SectionCard>

                <SectionCard number="5" title="Activities">
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="p-4 border border-slate-100 bg-slate-50 rounded-lg flex gap-4 items-start relative group">
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        value={activity.title}
                                        onChange={(e) => handleActivityChange(index, "title", e.target.value)}
                                        placeholder={`Activity ${index + 1} Title (e.g. Academic tutoring services)`}
                                        className="w-full px-3 py-2 border rounded-lg font-medium"
                                    />
                                    <textarea
                                        value={activity.description}
                                        onChange={(e) => handleActivityChange(index, "description", e.target.value)}
                                        placeholder="Activity Description (optional)"
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                </div>
                                <button type="button" onClick={() => removeActivity(index)} className="p-2 mt-1 text-slate-400 hover:text-red-500 bg-white shadow-sm rounded-lg opacity-50 group-hover:opacity-100 transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addActivity} className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800">
                            <Plus size={16} /> Add Activity
                        </button>
                    </div>
                </SectionCard>

                <SectionCard number="6" title="Financial & Commercial Terms">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormInput label="Package Name" name="packageName" value={form.packageName} onChange={handleFormChange} placeholder="e.g. Complete Setup Package" />
                        <FormInput label="Total Package Cost (QAR)" name="totalPackageCost" type="number" value={form.totalPackageCost} onChange={handleFormChange} />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1">Included Services</label>
                            <textarea name="includedServices" value={form.includedServices} onChange={handleFormChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="List included services..." />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1">Exclusions</label>
                            <textarea name="exclusions" value={form.exclusions} onChange={handleFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="List exclusions..." />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-1">Financial Notes</label>
                            <textarea name="financialNotes" value={form.financialNotes} onChange={handleFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Additional notes..." />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard number="7" title="Client Duties">
                    <textarea
                        name="clientDuties"
                        value={form.clientDuties}
                        onChange={handleFormChange}
                        rows={4}
                        placeholder="e.g. Passport copies, Qatar ID, Police clearance..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                </SectionCard>

                <SectionCard number="8" title="Payment Terms">
                    <textarea
                        name="paymentTerms"
                        value={form.paymentTerms}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                </SectionCard>

                {/* Global form actions fixed at bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition"
                    >
                        <FileEdit size={18} />
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition shadow-lg"
                    >
                        <Save size={18} />
                        {isEditing ? "Update Proposal" : "Save Proposal & Preview"}
                    </button>
                </div>
            </form>
        </div>
    );
}
