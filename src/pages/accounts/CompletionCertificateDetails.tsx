import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Printer, Edit2, Loader2 } from "lucide-react";
import { financeService } from "../../services/financeService";

export default function CompletionCertificateDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isEditing = false;

    // Certificate state
    const [certData, setCertData] = useState({
        certNo: "",
        date: new Date().toISOString().split("T")[0],
        companyName: "",
        projectName: "",
        product: "",
        poNo: "",
        dnNo: "",
        startDate: "",
        completionDate: "",
        hasNoRemarks: true,
        remarksDetails: "",
        clientSigner: "",
        detcSigner: ""
    });

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data: any = await financeService.getInvoice(id);

                if (data && data.invoice) {
                    const inv = data.invoice;
                    const items = data.items || [];
                    const productSummary = items.map((it: any) => it.description).filter(Boolean).join(", ");
                    const year = new Date().getFullYear();
                    const cleanInvNo = (inv.invoice_number || id).replace(/[^a-zA-Z0-9]/g, "").slice(-4);
                    const defaultCertNo = `DETC-${cleanInvNo || "001"}-${year}`;

                    setCertData({
                        certNo: inv.coc_number || defaultCertNo,
                        date: inv.coc_date || inv.invoice_date || new Date().toISOString().split("T")[0],
                        companyName: inv.client_company || inv.company_name || inv.company || inv.client_name || "",
                        projectName: inv.project_name || inv.projectName || "",
                        product: inv.coc_product || productSummary || "Supply and Installation Works",
                        poNo: inv.lpo_no || inv.reference_number || "",
                        dnNo: inv.delivery_note || "",
                        startDate: inv.coc_start_date || "",
                        completionDate: inv.coc_completion_date || inv.invoice_date || "",
                        hasNoRemarks: inv.coc_has_no_remarks !== undefined ? inv.coc_has_no_remarks : true,
                        remarksDetails: inv.coc_remarks || "",
                        clientSigner: inv.client_name || "",
                        detcSigner: inv.salesman || "Design Elements W.L.L"
                    });

                    // Check for print parameter
                    const searchParams = new URLSearchParams(location.search);
                    if (searchParams.get("print") === "true") {
                        setTimeout(() => {
                            window.print();
                        }, 800);
                    }
                } else {
                    setError("Invoice data not found");
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load certificate data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoice();
    }, [id, location.search]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 size={40} className="animate-spin text-brand-600" />
                <p className="text-slate-500 font-medium">Loading Certificate of Completion...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="text-red-500 font-bold">{error}</div>
                <button onClick={() => navigate('/invoices')} className="text-brand-600 hover:underline flex items-center gap-2 justify-center mx-auto">
                    <ArrowLeft size={16} /> Go Back to Invoices
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center mb-6 no-print max-w-[900px] mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-white rounded-full transition-colors" title="Back to Invoices">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Certificate of Completion</h1>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/edit-completion-certificate/${id}`)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition bg-white font-medium text-slate-700"
                        title="Edit Certificate Setup"
                    >
                        <Edit2 size={16} />
                        Edit Setup
                    </button>
                    <button 
                        onClick={handlePrint} 
                        className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-medium"
                    >
                        <Printer size={16} />
                        Print / Download PDF
                    </button>
                </div>
            </div>

            {/* A4 CERTIFICATE DOCUMENT */}
            <div className="max-w-[900px] min-h-[297mm] mx-auto bg-white font-serif text-black print:m-0 print:w-full print:min-h-[297mm] shadow-xl print:shadow-none border-t border-b-0 border-white relative flex flex-col justify-between">
                
                <div>
                    {/* Decorative Top Bar */}
                    <div className="h-4 bg-gray-200 w-full flex justify-end">
                        <div className="w-1/4 h-full bg-gray-600 transform skew-x-12 origin-top-right"></div>
                    </div>

                    {/* Header Section */}
                    <div className="px-10 pt-6 pb-2 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src="/logo.png" alt="Design Elements Logo" className="w-16 h-16 object-contain" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-gray-700 uppercase tracking-wider">DESIGN ELEMENTS</span>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">TRADING AND CONTRACTING W.L.L</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-10 py-4">
                        {/* Title Box */}
                        <div className="text-center mb-6">
                            <h1 className="text-lg font-bold tracking-wider uppercase border-b-2 border-black inline-block px-8 pb-1">
                                CERTIFICATE OF COMPLETION
                            </h1>
                        </div>

                        {/* Certificate Meta */}
                        <div className="text-[12px] font-sans space-y-1.5 mb-6">
                            <div className="flex items-center">
                                <span className="font-bold w-32">Certificate No. :</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={certData.certNo} 
                                        onChange={(e) => setCertData({ ...certData, certNo: e.target.value })}
                                        className="border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold w-64"
                                    />
                                ) : (
                                    <span className="font-semibold">{certData.certNo || "DETC-001-2026"}</span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <span className="font-bold w-32">Date:</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={certData.date} 
                                        onChange={(e) => setCertData({ ...certData, date: e.target.value })}
                                        className="border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold w-64"
                                    />
                                ) : (
                                    <span className="font-semibold">{certData.date}</span>
                                )}
                            </div>
                        </div>

                        {/* Project Details Section */}
                        <div className="mb-6">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-3 text-slate-800">PROJECT DETAILS</h2>
                            <div className="text-[12px] font-sans space-y-2">
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium">Company Name:</span>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={certData.companyName} 
                                            onChange={(e) => setCertData({ ...certData, companyName: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.companyName || "-"}</span>
                                    )}
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium">Project Name:</span>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={certData.projectName} 
                                            onChange={(e) => setCertData({ ...certData, projectName: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.projectName || "-"}</span>
                                    )}
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium">Product:</span>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={certData.product} 
                                            onChange={(e) => setCertData({ ...certData, product: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.product || "-"}</span>
                                    )}
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium">PO No.:</span>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={certData.poNo} 
                                            onChange={(e) => setCertData({ ...certData, poNo: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.poNo || "-"}</span>
                                    )}
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium">DN No.:</span>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={certData.dnNo} 
                                            onChange={(e) => setCertData({ ...certData, dnNo: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.dnNo || "-"}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Installation Dates */}
                        <div className="text-[12px] font-sans space-y-2 mb-6">
                            <div className="flex items-baseline">
                                <span className="w-48 text-slate-700 font-medium">Installation Start Date:</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 15-Jan-2026"
                                        value={certData.startDate} 
                                        onChange={(e) => setCertData({ ...certData, startDate: e.target.value })}
                                        className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                    />
                                ) : (
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.startDate || "\u00A0"}</span>
                                )}
                            </div>
                            <div className="flex items-baseline">
                                <span className="w-48 text-slate-700 font-medium">Installation Completion Date:</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 25-Jan-2026"
                                        value={certData.completionDate} 
                                        onChange={(e) => setCertData({ ...certData, completionDate: e.target.value })}
                                        className="border-b border-black flex-1 px-1 py-0.5 text-xs font-bold outline-none"
                                    />
                                ) : (
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.completionDate || "\u00A0"}</span>
                                )}
                            </div>
                        </div>

                        {/* Completion & Inspection Declaration */}
                        <div className="mb-6">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-1.5 text-slate-800">COMPLETION & INSPECTION</h2>
                            <p className="text-[12px] leading-relaxed text-slate-800 mb-1">
                                The above-mentioned installation works have been completed and inspected by the concerned parties.
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-800">
                                Upon inspection, the works have been found to be completed in accordance with the agreed requirements and are considered complete and ready for use, subject to any minor outstanding items or observations stated below.
                            </p>
                        </div>

                        {/* Outstanding Items / Remarks */}
                        <div className="mb-6">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-2 text-slate-800">OUTSTANDING ITEMS / REMARKS (if any):</h2>
                            <div className="text-[12px] space-y-1.5 pl-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={certData.hasNoRemarks} 
                                        onChange={(e) => setCertData({ ...certData, hasNoRemarks: e.target.checked })}
                                        className="rounded border-slate-400 text-brand-600 focus:ring-0"
                                    />
                                    <span className="font-medium">None</span>
                                </label>
                                <div className="flex items-baseline gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={!certData.hasNoRemarks} 
                                            onChange={(e) => setCertData({ ...certData, hasNoRemarks: !e.target.checked })}
                                            className="rounded border-slate-400 text-brand-600 focus:ring-0"
                                        />
                                        <span className="font-medium">Details:</span>
                                    </label>
                                    {isEditing && !certData.hasNoRemarks ? (
                                        <input 
                                            type="text" 
                                            placeholder="Enter any outstanding remarks..."
                                            value={certData.remarksDetails} 
                                            onChange={(e) => setCertData({ ...certData, remarksDetails: e.target.value })}
                                            className="border-b border-black flex-1 px-1 py-0.5 text-xs font-medium outline-none"
                                        />
                                    ) : (
                                        <span className="border-b border-black flex-1 pb-0.5 text-xs">{!certData.hasNoRemarks ? certData.remarksDetails : "\u00A0"}</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 italic mt-1.5 pl-2">
                                If there are no outstanding items, please check the None box.
                            </p>
                        </div>

                        {/* Client Acceptance */}
                        <div className="mb-10">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-1.5 text-slate-800">CLIENT ACCEPTANCE</h2>
                            <p className="text-[12px] leading-relaxed text-slate-800">
                                By signing this certificate, the Client / Authorized Representative confirms that the installation works described above have been completed and inspected.
                            </p>
                        </div>

                        {/* Signatures Section */}
                        <div className="pt-12 pb-4 flex justify-between items-end px-4">
                            <div className="text-center">
                                <div className="w-56 border-t border-black mb-1"></div>
                                <span className="text-[11px] font-bold tracking-wider font-sans text-slate-800">Signature & Date</span>
                            </div>
                            <div className="text-center">
                                <div className="w-56 border-t border-black mb-1"></div>
                                <span className="text-[11px] font-bold tracking-wider font-sans text-slate-800">For DETC Signature</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Section (Pinned to Lowest Section) */}
                <div>
                    <div className="flex flex-col items-center justify-end pt-4 pb-2 font-serif text-[10px] text-gray-500 font-bold bg-white w-full border-t border-gray-200 mt-auto">
                        <div className="flex items-center gap-2 uppercase tracking-wide">
                            <span>OCR No: 211686</span>
                            <span>•</span>
                            <span>+974 5023 4242</span>
                            <span>•</span>
                            <span>Doha - Qatar</span>
                        </div>
                        <div className="flex items-center gap-2 tracking-wide mt-1">
                            <span className="bg-gray-400 text-white rounded-full w-[14px] h-[14px] flex items-center justify-center text-[9px]">@</span>
                            <span>info@designelementsqatar.com</span>
                            <span className="mx-2 font-black text-gray-400">•</span>
                            <span>www.designelementsqatar.com</span>
                        </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className="h-4 bg-gray-200 w-full flex justify-start -mt-2">
                        <div className="w-1/4 h-full bg-gray-600 transform -skew-x-12 origin-top-left"></div>
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
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .bg-slate-50 { background: white !important; }
                    .p-6 { padding: 0 !important; }
                    .max-w-\\[900px\\] { 
                        max-width: 100% !important; 
                        width: 210mm !important;
                        box-shadow: none !important; 
                        margin: 0 auto !important;
                        display: flex !important;
                    }
                    @page { 
                        size: A4 portrait; 
                        margin: 5mm; 
                    }
                }
            `}</style>
        </div>
    );
}