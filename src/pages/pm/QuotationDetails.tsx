import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { numberToWords } from "../../utils/numberToWords";
import { printDocument } from "../../utils/exportUtils";
import { useQuery } from "@tanstack/react-query";
import { quotationService } from "../../services/quotationService";
import { useAuth } from "../../context/AuthContext";

export default function QuotationDetails() {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: quotation, isLoading, error } = useQuery({
        queryKey: ["quotation", id],
        queryFn: () => quotationService.getQuotation(id!),
        enabled: !!id
    });

    if (isLoading) return <div className="p-6 text-center text-slate-500">Loading quotation...</div>;
    
    if (error || !quotation) {
        return (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto my-12">
                <p className="text-red-500 mb-4 font-bold text-xl">Quotation Not Found</p>
                <button onClick={() => navigate(-1)} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">Return to List</button>
            </div>
        );
    }

    const handlePrint = () => {
        printDocument();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const items = quotation.items || [];
    const netTotal = quotation.total_amount || 0;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 no-print font-sans max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Quote: {quotation.qtn_number}</h1>
                    <StatusBadge status={quotation.status || "PENDING_APPROVAL"} />
                </div>
                <div className="flex gap-3">
                    {user?.role !== "CLIENT" && (
                        <button onClick={() => navigate('/edit-quotation/' + quotation.id)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition bg-white font-medium">
                            <Edit size={16} /> Edit
                        </button>
                    )}
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-medium">
                        <Printer size={16} /> Print Quote
                    </button>
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:m-0 font-['Inter',_sans-serif] text-slate-800 print:text-black">
                
                <div className="p-[15mm] min-h-[297mm] flex flex-col relative print:p-0">
                    
                    <table className="w-full border-none border-collapse print-doc-table">
                        {/* REPEATING HEADER FOR PRINT */}
                        <thead>
                            <tr>
                                <th className="border-none p-0 font-normal text-left">
                                    <div className="print-header-wrapper mb-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 flex items-center justify-center">
                                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <h1 className="text-2xl font-black tracking-tighter leading-none text-[#333]">DESIGN ELEMENTS</h1>
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#666] leading-none mt-1">TRADING AND CONTRACTING W.L.L</p>
                                                    <p className="text-[10px] font-bold text-[#666] leading-none mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</p>
                                                </div>
                                            </div>
                                            <div className="h-4 w-64 bg-gradient-to-l from-slate-800 to-transparent"></div>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        {/* REPEATING FOOTER FOR PRINT */}
                        <tfoot>
                            <tr>
                                <td className="border-none p-0">
                                    <div className="print-footer-wrapper mt-auto pt-4 border-t border-slate-200">
                                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-3">
                                                <span>CR No: 211686</span>
                                                <span>•</span>
                                                <span>+974 5023 4242</span>
                                                <span>•</span>
                                                <span>Doha - Qatar</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span>info@designelementsqatar.com</span>
                                                <span>•</span>
                                                <span>www.designelementsqatar.com</span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-slate-800 mt-2"></div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>

                        {/* DOCUMENT BODY CONTENT */}
                        <tbody>
                            <tr>
                                <td className="border-none p-0">
                                    <div className="print-content-wrapper flex flex-col relative">

                                        {/* Reference & Date Row */}
                                        <div className="flex justify-between items-center mb-6 font-bold text-sm">
                                            <div className="flex gap-2">
                                                <span>Quote Ref:</span>
                                                <span className="text-black">{quotation.qtn_number}</span>
                                            </div>
                                            <div className="text-black">
                                                {formatDate(quotation.created_at)}
                                            </div>
                                        </div>

                                        {/* Client Information Block */}
                                        <div className="mb-6 space-y-0.5 text-sm">
                                            {quotation.client_company ? (
                                                <>
                                                    <h2 className="font-black text-black uppercase">{quotation.client_company}</h2>
                                                    {quotation.client_name && (
                                                        <p className="font-bold text-slate-800 text-[13px]">Attn: <span className="uppercase">{quotation.client_name}</span></p>
                                                    )}
                                                </>
                                            ) : (
                                                <h2 className="font-black text-black uppercase">{quotation.client_name}</h2>
                                            )}
                                            <p className="text-slate-600 italic">Doha, Qatar,</p>
                                            <p className="text-slate-600 font-medium">Mob: +974 {quotation.client_phone || 'XXXX XXXX'}</p>
                                            <p className="text-brand-600 font-medium lowercase">Email: {quotation.client_email || 'client@example.com'}</p>
                                        </div>

                                        {/* Meta Details Table */}
                                        <div className="border border-slate-300 mb-6 text-[13px]">
                                            <div className="grid grid-cols-[100px_1fr] border-b border-slate-300">
                                                <div className="bg-slate-50 p-2 font-black border-r border-slate-300 uppercase">Attn:</div>
                                                <div className="p-2 font-bold text-black">{quotation.attn} | {quotation.attn_designation}</div>
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] border-b border-slate-300">
                                                <div className="bg-slate-50 p-2 font-black border-r border-slate-300 uppercase">Project:</div>
                                                <div className="p-2 font-bold text-black">{quotation.project_name}</div>
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr]">
                                                <div className="bg-slate-50 p-2 font-black border-r border-slate-300 uppercase">Ref.:</div>
                                                <div className="p-2 font-bold text-black">{quotation.reference_no}</div>
                                            </div>
                                        </div>

                                        {/* Salutation & Intro */}
                                        <div className="mb-6">
                                            <p className="text-[12px] font-semibold text-black mb-1">{quotation.salutation}</p>
                                            <p className="text-[13px] leading-relaxed text-slate-700 italic">
                                                {quotation.intro_text}
                                            </p>
                                        </div>

                                        {/* Body Sections */}
                                        <div className="space-y-4 mb-8 text-[13px]">
                                            <div className="break-inside-avoid">
                                                <h3 className="font-black text-black underline mb-1">1. Terms & Conditions:</h3>
                                                <div className="whitespace-pre-wrap pl-4 leading-relaxed text-slate-700">
                                                    {quotation.tc_terms}
                                                </div>
                                            </div>
                                            <div className="break-inside-avoid">
                                                <h3 className="font-black text-black underline mb-1">2. Payment Terms:</h3>
                                                <div className="whitespace-pre-wrap pl-4 leading-relaxed text-slate-700">
                                                    {quotation.tc_payment}
                                                </div>
                                            </div>
                                            <div className="break-inside-avoid">
                                                <h3 className="font-black text-black underline mb-1">3. Delivery & Storage:</h3>
                                                <div className="whitespace-pre-wrap pl-4 leading-relaxed text-slate-700">
                                                    {quotation.tc_delivery}
                                                </div>
                                            </div>
                                            {quotation.tc_installation && (
                                                <div className="break-inside-avoid">
                                                    <h3 className="font-black text-black underline mb-1">{quotation.selected_format === 'quotation3' ? '1. Installation:' : '4. Installation:'}</h3>
                                                    <div className="whitespace-pre-wrap pl-4 leading-relaxed text-slate-700">
                                                        {quotation.tc_installation}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="break-inside-avoid">
                                                <h3 className="font-black text-black underline mb-1">{quotation.selected_format === 'quotation3' ? '5. Validity:' : '4. Validity:'}</h3>
                                                <div className="whitespace-pre-wrap pl-4 leading-relaxed text-slate-700">
                                                    {quotation.tc_validity}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Table with Auto-Wrapping Item Description */}
                                        <div className="mb-6 flex-grow">
                                            <table className="w-full border-collapse border border-slate-400 text-[12px] table-fixed">
                                                <thead>
                                                    <tr className="bg-slate-100 text-black font-black uppercase border-b border-slate-400 text-[10px]">
                                                        <th className="border border-slate-400 px-2 py-2 text-center w-12">Sr. No.</th>
                                                        <th className="border border-slate-400 px-2 py-2 text-center w-20">Item Code</th>
                                                        <th className="border border-slate-400 px-3 py-2 text-left font-bold">{quotation?.selected_format === 'quotation3' ? 'Particulars' : 'Item Description'}</th>
                                                        <th className="border border-slate-400 px-2 py-2 text-center w-14">{quotation?.selected_format === 'quotation3' ? 'Qty m2' : 'Unit'}</th>
                                                        {quotation?.selected_format !== 'quotation3' && <th className="border border-slate-400 px-2 py-2 text-center w-12">Qty</th>}
                                                        <th className="border border-slate-400 px-3 py-2 text-right w-24">Rate {quotation?.selected_format === 'quotation3' ? 'in QAR' : ''}</th>
                                                        <th className="border border-slate-400 px-3 py-2 text-right w-28">Amount {quotation?.selected_format === 'quotation3' ? 'in QAR' : ''}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-800">
                                                    {items.map((item: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-slate-300">
                                                            <td className="border border-slate-400 px-2 py-3 text-center align-top font-bold">
                                                                {item.customSrNo || (idx + 1).toString().padStart(2, '0')}
                                                            </td>
                                                            <td className="border border-slate-400 px-2 py-3 text-center align-top font-bold text-slate-700 break-words [overflow-wrap:anywhere]">
                                                                {item.itemCode || item.item_code || "-"}
                                                            </td>
                                                            <td className="border border-slate-400 px-3 py-3 align-top whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed font-semibold text-black">
                                                                {item.description}
                                                            </td>
                                                            <td className="border border-slate-400 px-2 py-3 text-center align-top font-medium">
                                                                {quotation?.selected_format === 'quotation3' ? `${item.quantity} ${item.unit}` : (item.unit || "Nos")}
                                                            </td>
                                                            {quotation?.selected_format !== 'quotation3' && (
                                                                <td className="border border-slate-400 px-2 py-3 text-center align-top font-bold">{item.quantity?.toString().padStart(2, '0')}</td>
                                                            )}
                                                            <td className="border border-slate-400 px-3 py-3 text-right align-top font-medium italic">
                                                                {item.unitPrice ? Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "Lumpsum"}
                                                            </td>
                                                            <td className="border border-slate-400 px-3 py-3 text-right align-top font-black text-black">
                                                                {Number(item.amount || (item.quantity * item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Total Row */}
                                                    <tr className="font-black bg-slate-50 border-t-2 border-slate-400">
                                                        <td className="border border-slate-400 px-3 py-2 uppercase text-center" colSpan={1}>Total</td>
                                                        <td className="border border-slate-400 px-3 py-2 text-center text-[11px]" colSpan={quotation?.selected_format === 'quotation3' ? 4 : 5}>
                                                            {numberToWords(netTotal).toUpperCase()}
                                                        </td>
                                                        <td className="border border-slate-400 px-3 py-2 text-right text-black bg-white">
                                                            {Number(netTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Closing & Signatures */}
                                        <div className="mt-8 pt-4 space-y-8 break-inside-avoid relative">
                                            {/* Closing Text */}
                                            <div className="mb-6">
                                                <p className="text-[14px] leading-relaxed text-slate-700 italic font-medium">
                                                    {quotation.outro_text}
                                                </p>
                                            </div>

                                            {/* Sign-off */}
                                            <div className="space-y-1 mb-8">
                                                <p className="text-sm font-bold text-black">Thanks, and regards,</p>
                                                <div className="pt-4 font-sans">
                                                    <p className="text-lg font-black text-black leading-none">{quotation.salesman}</p>
                                                    <p className="text-[13px] font-bold text-slate-500">{quotation.salesman_designation}</p>
                                                </div>
                                            </div>

                                            {/* Salesman Contacts */}
                                            <div className="text-[13px] font-bold space-y-0.5 text-slate-700">
                                                <p>M: {quotation.salesman_phone}</p>
                                                <p>E: <span className="text-brand-600 lowercase">{quotation.salesman_email}</span></p>
                                                <p>Doha, State of Qatar</p>
                                            </div>
                                        </div>

                                        {/* Watermark Logo */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -z-10 select-none">
                                            <img src="/logo.png" alt="Watermark" className="w-[500px] h-[500px] object-contain grayscale" />
                                        </div>

                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* FIXED PRINT FOOTER (ALWAYS PINNED TO LOWEST PART OF EVERY PRINTED PAGE) */}
                    <div className="print-fixed-footer hidden">
                        <div className="pt-2 border-t border-slate-200 bg-white">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <span>CR No: 211686</span>
                                    <span>•</span>
                                    <span>+974 5023 4242</span>
                                    <span>•</span>
                                    <span>Doha - Qatar</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span>info@designelementsqatar.com</span>
                                    <span>•</span>
                                    <span>www.designelementsqatar.com</span>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-800 mt-2"></div>
                        </div>
                    </div>

                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                    }
                    .bg-slate-50 { background-color: white !important; }
                    .p-6 { padding: 0 !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .w-\\[210mm\\] { width: 100% !important; max-width: 210mm !important; }
                    
                    .print-doc-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .print-doc-table thead {
                        display: table-header-group !important;
                    }
                    .print-doc-table tfoot {
                        display: table-footer-group !important;
                        visibility: hidden !important;
                    }
                    .print-doc-table tfoot .print-footer-wrapper {
                        height: 20mm !important;
                    }
                    .print-doc-table tbody {
                        display: table-row-group !important;
                    }
                    .print-doc-table tr {
                        page-break-inside: auto !important;
                    }
                    .print-header-wrapper {
                        padding-bottom: 6mm;
                    }
                    .print-footer-wrapper {
                        padding-top: 4mm;
                        padding-bottom: 4mm;
                    }
                    .print-fixed-footer {
                        display: block !important;
                        position: fixed !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        z-index: 9999 !important;
                    }

                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .break-before-page { page-break-before: always; }
                    .bg-slate-100 { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact !important; }
                    .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
                    .bg-slate-800 { background-color: #1e293b !important; -webkit-print-color-adjust: exact !important; }
                    .text-brand-600 { color: #2563eb !important; }
                    @page { 
                        margin: 12mm 15mm 20mm 15mm; 
                        size: A4 portrait; 
                    }
                }

                .italic { font-style: italic; }
            `}</style>
        </div>
    );
}
