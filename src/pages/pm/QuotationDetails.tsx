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
            <div className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none print:m-0 font-['Inter',_sans-serif] text-slate-800 print:text-black flex flex-col justify-between">
                
                <div className="p-[15mm] min-h-[297mm] flex flex-col justify-between relative print:p-0">
                    
                    <table className="w-full min-h-[267mm] border-none border-collapse print-doc-table flex-1 flex flex-col justify-between print:table">
                        {/* REPEATING HEADER FOR PRINT */}
                        <thead className="w-full block print:table-header-group">
                            <tr className="w-full block print:table-row">
                                <th className="border-none p-0 font-normal text-left block print:table-cell w-full">
                                    <div className="print-header-wrapper mb-4">
                                        {/* Decorative Top Bar */}
                                        <div className="h-4 bg-gray-200 w-full flex justify-end">
                                            <div className="w-1/4 h-full bg-gray-600 transform skew-x-12 origin-top-right"></div>
                                        </div>

                                        {/* Header Section */}
                                        <div className="pt-6 pb-2 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <img src="/logo.png" alt="Design Elements Logo" className="w-16 h-16 object-contain" />
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-gray-700 uppercase tracking-wider">DESIGN ELEMENTS</span>
                                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">TRADING AND CONTRACTING W.L.L</span>
                                                    <span className="text-[10px] text-gray-400 font-bold mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        {/* DOCUMENT BODY CONTENT */}
                        <tbody className="flex-1 flex flex-col justify-between print:table-row-group">
                            <tr className="flex-1 flex flex-col justify-between print:table-row">
                                <td className="border-none p-0 flex-1 flex flex-col justify-between print:table-cell">
                                    <div className="print-content-wrapper flex flex-col justify-between flex-1 min-h-[190mm] relative">

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
                                                        <th className="border border-slate-400 px-1 py-2 text-center w-12">Sr. No.</th>
                                                        <th className="border border-slate-400 px-2 py-2 text-center w-16">Item Code</th>
                                                        <th className="border border-slate-400 px-3 py-2 text-center font-bold">{quotation?.selected_format === 'quotation3' ? 'Particulars' : 'Item Description'}</th>
                                                        <th className="border border-slate-400 px-1 py-2 text-center w-12">{quotation?.selected_format === 'quotation3' ? 'Qty m2' : 'Unit'}</th>
                                                        {quotation?.selected_format !== 'quotation3' && <th className="border border-slate-400 px-2 py-2 text-center w-20">Qty</th>}
                                                        <th className="border border-slate-400 px-2 py-2 text-right w-24">Rate {quotation?.selected_format === 'quotation3' ? 'in QAR' : ''}</th>
                                                        <th className="border border-slate-400 px-2 py-2 text-right w-44">Amount {quotation?.selected_format === 'quotation3' ? 'in QAR' : ''}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-800">
                                                    {items.map((item: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-slate-300">
                                                             <td className="border border-slate-400 px-1 py-3 text-center align-top font-bold text-[11px]">
                                                                 {item.customSrNo || (idx + 1).toString().padStart(2, '0')}
                                                             </td>
                                                             <td className="border border-slate-400 px-1 py-3 text-center align-top font-bold text-slate-700 break-words [overflow-wrap:anywhere] text-[11px]">
                                                                 {item.itemCode || item.item_code || "-"}
                                                             </td>
                                                             <td className="border border-slate-400 px-3 py-3 align-top whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed font-semibold text-black">
                                                                 {item.description}
                                                             </td>
                                                             <td className="border border-slate-400 px-1 py-3 text-center align-top font-medium text-[11px]">
                                                                 {quotation?.selected_format === 'quotation3' ? `${(parseFloat(String(item.quantity).replace(/,/g, '')) || 0).toLocaleString()} ${item.unit}` : (item.unit || "Nos")}
                                                             </td>
                                                             {quotation?.selected_format !== 'quotation3' && (
                                                                 <td className="border border-slate-400 px-1 py-3 text-center align-top font-bold whitespace-nowrap text-[11px]">
                                                                     {(parseFloat(String(item.quantity).replace(/,/g, '')) || 0).toLocaleString()}
                                                                 </td>
                                                             )}
                                                             <td className="border border-slate-400 px-2 py-3 text-right align-top font-medium italic whitespace-nowrap text-[11px]">
                                                                 {item.unitPrice ? (parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Lumpsum"}
                                                             </td>
                                                             <td className="border border-slate-400 px-2 py-3 text-right align-top font-black text-black whitespace-nowrap text-[11px]">
                                                                 {(parseFloat(String(item.amount || ((parseFloat(String(item.quantity).replace(/,/g, '')) || 0) * (parseFloat(String(item.unitPrice).replace(/,/g, '')) || 0)))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                                                             </td>
                                                         </tr>
                                                     ))}
                                                     {/* Total Row */}
                                                     <tr className="font-black bg-slate-50 border-t-2 border-slate-400">
                                                         <td className="border border-slate-400 px-2 py-2 uppercase text-center text-[11px]" colSpan={2}>Total</td>
                                                         <td className="border border-slate-400 px-3 py-2 text-center text-[11px] leading-snug" colSpan={quotation?.selected_format === 'quotation3' ? 3 : 4}>
                                                             {numberToWords(netTotal).toUpperCase()}
                                                         </td>
                                                         <td className="border border-slate-400 px-2 py-2 text-right text-black bg-white whitespace-nowrap font-black text-[11px]">
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

                        {/* REPEATING FOOTER FOR PRINT */}
                        <tfoot className="w-full mt-auto block print:table-footer-group">
                            <tr className="w-full block print:table-row">
                                <td className="border-none p-0 block print:table-cell w-full">
                                    <div className="print-footer-spacer hidden print:block h-[18mm]"></div>
                                    <div className="print-footer-wrapper text-center font-bold font-serif text-[10px] pt-4 pb-2 bg-white w-full border-t border-gray-200 mt-auto">
                                        <div className="flex items-center justify-center gap-2">
                                            <span>OCR No: 211686</span>
                                            <span>•</span>
                                            <span>+974 5023 4242</span>
                                            <span>•</span>
                                            <span>Doha - Qatar</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <span className="bg-gray-400 text-white rounded-full w-[14px] h-[14px] flex items-center justify-center text-[9px]">@</span>
                                            <span>info@designelementsqatar.com</span>
                                            <span className="mx-2 font-black text-gray-400">•</span>
                                            <span>www.designelementsqatar.com</span>
                                        </div>
                                        {/* Decorative Bottom Bar */}
                                        <div className="h-3 bg-gray-200 w-full flex justify-start mt-2">
                                            <div className="w-1/4 h-full bg-gray-600 transform -skew-x-12 origin-top-left"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                
                * {
                    font-variant-numeric: lining-nums tabular-nums;
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
                    .bg-slate-50 { background-color: white !important; }
                    .p-6 { padding: 0 !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .w-\\[210mm\\] { 
                        width: 210mm !important; 
                        max-width: 100% !important; 
                        box-shadow: none !important; 
                        margin: 0 auto !important;
                        display: block !important;
                    }
                    
                    .print-doc-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        display: table !important;
                    }
                    .print-doc-table thead {
                        display: table-header-group !important;
                    }
                    .print-doc-table tfoot {
                        display: table-footer-group !important;
                    }
                    .print-doc-table tbody {
                        display: table-row-group !important;
                    }
                    .print-doc-table tr {
                        display: table-row !important;
                        page-break-inside: avoid !important;
                    }
                    .print-doc-table td, .print-doc-table th {
                        display: table-cell !important;
                    }

                    .print-footer-wrapper {
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
                        size: A4 portrait; 
                        margin: 8mm 10mm 8mm 10mm; 
                    }
                }

                .italic { font-style: italic; }
            `}</style>
        </div>
    );
}
