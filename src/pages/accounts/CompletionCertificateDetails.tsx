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

    // Certificate state
    const [certData, setCertData] = useState<{
        certNo: string;
        date: string;
        companyName: string;
        projectName: string;
        product: string;
        poNo: string;
        dnNo: string;
        startDate: string;
        completionDate: string;
        hasNoRemarks: boolean | null;
        remarksDetails: string;
        clientSigner: string;
        detcSigner: string;
    }>({
        certNo: "",
        date: new Date().toISOString().split("T")[0],
        companyName: "",
        projectName: "",
        product: "",
        poNo: "",
        dnNo: "",
        startDate: "",
        completionDate: "",
        hasNoRemarks: null,
        remarksDetails: "",
        clientSigner: "",
        detcSigner: ""
    });
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data: any = await financeService.getInvoice(id);

                if (data && data.invoice) {
                    const inv = data.invoice;
                    setIsDeleted(Boolean(inv.coc_deleted_at || inv.deleted_at));
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
                        hasNoRemarks: inv.coc_has_no_remarks !== undefined ? inv.coc_has_no_remarks : null,
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
            <div className="flex justify-between items-center mb-6 no-print max-w-[850px] mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors" title="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Certificate of Completion</h1>
                    {isDeleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            🗑️ Recycle Bin (Read Only)
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    {!isDeleted && (
                        <button 
                            onClick={() => navigate(`/edit-completion-certificate/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition bg-white font-medium text-slate-700"
                            title="Edit Certificate Setup"
                        >
                            <Edit2 size={16} />
                            Edit Setup
                        </button>
                    )}
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
            <div className="cert-container max-w-[850px] mx-auto bg-white font-serif text-black shadow-xl print:shadow-none border-t border-b-0 border-white relative flex flex-col justify-between" style={{ minHeight: "1050px" }}>
                
                <div>
                    {/* Decorative Top Bar */}
                    <svg className="w-full h-3.5 block" viewBox="0 0 1000 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="1000" height="14" fill="#e5e7eb" />
                        <polygon points="720,0 1000,0 1000,14 740,14" fill="#4b5563" />
                    </svg>

                    {/* Header Section */}
                    <div className="px-10 pt-4 pb-1 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src="/logo.png" alt="Design Elements Logo" className="w-14 h-14 object-contain" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-700 uppercase tracking-wider leading-tight">DESIGN ELEMENTS</span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-tight">TRADING AND CONTRACTING W.L.L</span>
                                <span className="text-[9px] text-gray-400 font-bold mt-0.5 leading-tight">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-10 py-2">
                        {/* Title Box */}
                        <div className="text-center mb-3">
                            <h1 className="text-base font-bold tracking-wider uppercase border-b-2 border-black inline-block px-8 pb-0.5">
                                CERTIFICATE OF COMPLETION
                            </h1>
                        </div>

                        {/* Certificate Meta */}
                        <div className="text-[11.5px] font-sans space-y-1 mb-3">
                            <div className="flex items-center">
                                <span className="font-bold w-32">Certificate No. :</span>
                                <span className="font-semibold">{certData.certNo || "DETC-001-2026"}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-bold w-32">Date:</span>
                                <span className="font-semibold">{certData.date}</span>
                            </div>
                        </div>

                        {/* Project Details Section */}
                        <div className="mb-3">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-2 text-slate-800">PROJECT DETAILS</h2>
                            <div className="text-[11.5px] font-sans space-y-1.5">
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium shrink-0">Company Name:</span>
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.companyName || "-"}</span>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium shrink-0">Project Name:</span>
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.projectName || "-"}</span>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium shrink-0">Product:</span>
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.product || "-"}</span>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium shrink-0">PO No.:</span>
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.poNo || "-"}</span>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="w-36 text-slate-700 font-medium shrink-0">DN No.:</span>
                                    <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.dnNo || "-"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Installation Dates */}
                        <div className="text-[11.5px] font-sans space-y-1.5 mb-3">
                            <div className="flex items-baseline">
                                <span className="w-48 text-slate-700 font-medium shrink-0">Installation Start Date:</span>
                                <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.startDate || "\u00A0"}</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="w-48 text-slate-700 font-medium shrink-0">Installation Completion Date:</span>
                                <span className="border-b border-black flex-1 font-bold pb-0.5">{certData.completionDate || "\u00A0"}</span>
                            </div>
                        </div>

                        {/* Completion & Inspection Declaration */}
                        <div className="mb-3">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-1 text-slate-800">COMPLETION & INSPECTION</h2>
                            <p className="text-[11.5px] leading-relaxed text-slate-800 mb-0.5">
                                The above-mentioned installation works have been completed and inspected by the concerned parties.
                            </p>
                            <p className="text-[11.5px] leading-relaxed text-slate-800">
                                Upon inspection, the works have been found to be completed in accordance with the agreed requirements and are considered complete and ready for use, subject to any minor outstanding items or observations stated below.
                            </p>
                        </div>

                        {/* Outstanding Items / Remarks */}
                        <div className="mb-3">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-1.5 text-slate-800">OUTSTANDING ITEMS / REMARKS (if any):</h2>
                            <div className="text-[11.5px] space-y-1.5 pl-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border border-black inline-block"></span>
                                    <span className="font-medium text-[11.5px]">None</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="w-3.5 h-3.5 border border-black inline-block self-center"></span>
                                    <span className="font-medium text-[11.5px] shrink-0">Details:</span>
                                    <span className="border-b border-black flex-1 text-[11.5px] font-semibold pb-0.5 min-h-[16px]">
                                        {certData.remarksDetails || "\u00A0"}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[9.5px] text-slate-500 italic mt-1 pl-1">
                                If there are no outstanding items, please check the None box.
                            </p>
                        </div>

                        {/* Client Acceptance */}
                        <div className="mb-4">
                            <h2 className="font-bold uppercase tracking-wider text-[11px] mb-1 text-slate-800">CLIENT ACCEPTANCE</h2>
                            <p className="text-[11.5px] leading-relaxed text-slate-800">
                                By signing this certificate, the Client / Authorized Representative confirms that the installation works described above have been completed and inspected.
                            </p>
                        </div>

                        {/* Signatures Section */}
                        <div className="pt-6 pb-2 flex justify-between items-end px-4">
                            <div className="text-center">
                                <div className="w-52 border-t border-black mb-1"></div>
                                <span className="text-[10.5px] font-bold tracking-wider font-sans text-slate-800">Signature & Date</span>
                            </div>
                            <div className="text-center">
                                <div className="w-52 border-t border-black mb-1"></div>
                                <span className="text-[10.5px] font-bold tracking-wider font-sans text-slate-800">For DETC Signature</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Section (Pinned to Lowest Section) */}
                <div>
                    <div className="flex flex-col items-center justify-end pt-3 pb-1.5 font-serif text-[9.5px] text-gray-500 font-bold bg-white w-full border-t border-gray-200 mt-auto">
                        <div className="flex items-center gap-2 uppercase tracking-wide">
                            <span>OCR No: 211686</span>
                            <span>•</span>
                            <span>+974 5023 4242</span>
                            <span>•</span>
                            <span>Doha - Qatar</span>
                        </div>
                        <div className="flex items-center gap-2 tracking-wide mt-0.5">
                            <span className="bg-gray-400 text-white rounded-full w-[13px] h-[13px] flex items-center justify-center text-[8.5px]">@</span>
                            <span>info@designelementsqatar.com</span>
                            <span className="mx-1.5 font-black text-gray-400">•</span>
                            <span>www.designelementsqatar.com</span>
                        </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <svg className="w-full h-3.5 block -mt-1" viewBox="0 0 1000 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="1000" height="14" fill="#e5e7eb" />
                        <polygon points="0,0 280,0 260,14 0,14" fill="#4b5563" />
                    </svg>
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
                    @page { 
                        size: A4 portrait; 
                        margin: 0 !important; 
                    }
                    *, *::before, *::after {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    html, body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: white !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        overflow: hidden !important;
                    }
                    .bg-slate-50 { background: white !important; }
                    .p-6 { padding: 0 !important; }
                    .cert-container { 
                        width: 210mm !important; 
                        height: 297mm !important; 
                        max-height: 297mm !important; 
                        box-shadow: none !important; 
                        margin: 0 auto !important;
                        padding: 0 !important;
                        border: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        overflow: hidden !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}