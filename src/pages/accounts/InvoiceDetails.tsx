import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Printer, Edit, Loader2, Award, FileText } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { financeService } from "../../services/financeService";
import type { Invoice } from "../../types/finance";

function numberToWords(amount: number): string {
    const internationalWords = (num: number): string => {
        if (num === 0) return 'Zero';
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const scales = ['', 'Thousand', 'Million', 'Billion'];

        let words = '';
        let scaleIdx = 0;

        let n = Math.floor(num);
        while (n > 0) {
            const chunk = n % 1000;
            if (chunk > 0) {
                let chunkStr = '';
                const h = Math.floor(chunk / 100);
                const t = chunk % 100;
                if (h > 0) chunkStr += ones[h] + ' Hundred ';
                if (t > 0) {
                    if (t < 20) chunkStr += ones[t] + ' ';
                    else {
                        chunkStr += tens[Math.floor(t / 10)] + ' ';
                        if (t % 10 > 0) chunkStr += ones[t % 10] + ' ';
                    }
                }
                words = chunkStr + scales[scaleIdx] + ' ' + words;
            }
            n = Math.floor(n / 1000);
            scaleIdx++;
        }
        return words.trim();
    };

    const wholePart = Math.floor(amount);
    const decimalPart = Math.round((amount - wholePart) * 100);

    let result = `Qatari Riyals ${internationalWords(wholePart)}`;
    if (decimalPart > 0) {
        result += ` and ${internationalWords(decimalPart)} Dirhams`;
    }
    return result + ' Only';
}

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isClient = user?.role === "CLIENT";

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data: any = await financeService.getInvoice(id);

                if (data && data.invoice) {
                    const inv = data.invoice;
                    const items = (data.items || []).map((it: any) => ({
                        id: it.id,
                        description: it.description,
                        quantity: it.quantity,
                        unitPrice: it.unit_price,
                        amount: it.total,
                        code: it.code
                    }));

                    const mappedInvoice: Invoice = {
                        id: inv.id,

                        invoiceNo: inv.invoice_number,

                        client: inv.client_name || inv.client,

                        clientCompany: inv.client_company || inv.company_name || inv.company,

                        customerCode: inv.customer_code,

                        clientId: inv.client_id,

                        status: inv.status,

                        date: inv.invoice_date,

                        dueDate: inv.due_date,

                        amount: inv.total_amount,

                        total: inv.total_amount,

                        taxRate: inv.tax_rate,

                        taxAmount: inv.tax_amount,

                        discount: inv.discount,

                        // NEW
                        amount_paid: Number(inv.amount_paid || 0),

                        balance: Number(inv.balance_amount),

                        items: items,

                        division: inv.division,

                        branch: inv.division,

                        notes: inv.notes,

                        lpoNo: inv.lpo_no,

                        salesman: inv.salesman,

                        qid: inv.qid,

                        address: inv.address,

                        refType: inv.ref_type,

                        refNo: inv.ref_no || inv.reference_number,

                        paymentTerms: inv.payment_terms,

                        invoiceType: inv.invoice_type || "Credit",

                        approvalStatus: inv.approval_status,

                        contactNumber: inv.contact_number,

                        deliveryNote: inv.delivery_note,

                        project: inv.project_name || inv.project
                    };
                    setInvoice(mappedInvoice);

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
                console.error("Error fetching invoice:", err);
                setError(err.message || "Failed to load invoice");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoice();
    }, [id, location.search]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 size={40} className="animate-spin text-brand-600" />
                <p className="text-slate-500 font-medium">Loading invoice details...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="text-red-500 font-bold">{error || "Invoice not found."}</div>
                <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline flex items-center gap-2 justify-center">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };


    const items = invoice.items || [];

    const totalAmount = Number(invoice.total || 0);

    const advancePaid = Number(invoice.amount_paid || 0);

    const balance = totalAmount - advancePaid;

    const isDeleted = Boolean((invoice as any)?.deleted_at);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Invoice: {invoice.invoiceNo}</h1>
                    <StatusBadge status={invoice.status} />
                    {isDeleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            🗑️ Recycle Bin (Read Only)
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate(`/delivery-note/${id}`)} 
                        className="flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-slate-50 transition bg-white text-xs font-bold text-emerald-700 border-emerald-300"
                        title="View Delivery Note"
                    >
                        <FileText size={15} />
                        Delivery Note
                    </button>
                    <button 
                        onClick={() => navigate(`/completion-certificate/${id}`)} 
                        className="flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-slate-50 transition bg-white text-xs font-bold text-purple-700 border-purple-300"
                        title="View Certificate of Completion"
                    >
                        <Award size={15} />
                        Completion Certificate
                    </button>
                    {!isClient && !isDeleted && (
                        <button onClick={() => navigate(`/edit-invoice/${id}`)} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-slate-50 transition bg-white text-xs font-bold text-slate-700">
                            <Edit size={15} />
                            Edit
                        </button>
                    )}
                    <button onClick={handlePrint} className="flex items-center gap-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm text-xs font-bold">
                        <Printer size={15} />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* NEW INVOICE DESIGN (EXACT MATCH) */}
            <div className="max-w-[900px] min-h-[280mm] mx-auto bg-white font-serif text-black print:m-0 print:w-full print:min-h-[280mm] border-t border-b-0 border-white relative print-inv-container flex flex-col justify-between">
                <table className="w-full min-h-[275mm] border-none border-collapse print-doc-table">
                    {/* REPEATING HEADER FOR PRINT */}
                    <thead>
                        <tr>
                            <th className="border-none p-0 font-normal text-left">
                                {/* Decorative Top Bar */}
                                <div className="h-4 bg-gray-200 w-full flex justify-end">
                                    <div className="w-1/4 h-full bg-gray-600 transform skew-x-12 origin-top-right"></div>
                                </div>

                                {/* Header Section */}
                                <div className="p-8 pb-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <img src="/logo.png" alt="Design Elements Logo" className="w-16 h-16 object-contain" />
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-gray-700 uppercase tracking-wider">DESIGN ELEMENTS</span>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">TRADING AND CONTRACTING W.L.L</span>
                                            <span className="text-[10px] text-gray-400 font-bold mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    {/* REPEATING FOOTER FOR PRINT (PINNED TO LOWEST SECTION) */}
                    <tfoot>
                        <tr>
                            <td className="border-none p-0">
                                <div className="text-center font-bold font-serif text-[10px] pt-4 pb-2 bg-white w-full border-t border-gray-200 mt-auto">
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
                                </div>
                            </td>
                        </tr>
                    </tfoot>

                    {/* MAIN BODY CONTENT */}
                    <tbody>
                        <tr>
                            <td className="border-none p-0">
                                <div className="px-8 pb-4 flex flex-col justify-between min-h-[190mm]">
                                    <div>
                                        {/* Title Box */}
                                        <div className="border border-black border-collapse mb-4 mt-2 h-8 flex items-center justify-center">
                                            <h1 className="font-bold tracking-widest text-[14px] uppercase underline decoration-2 underline-offset-4">INVOICE</h1>
                                        </div>

                                        <div className="flex flex-col">
                                            {/* Two Column Layout */}
                                            <div className="flex justify-between gap-4 h-48">
                                                {/* Left Column */}
                                                <div className="w-1/2 flex flex-col justify-between">
                                                    <div className="border border-black p-2 text-[11px] h-32 flex flex-col font-bold font-serif leading-tight">
                                                        {invoice.clientCompany ? (
                                                            <>
                                                                <div className="uppercase mb-0.5">{invoice.clientCompany}</div>
                                                                {invoice.client && (
                                                                    <div className="text-[10px] text-gray-700 font-semibold mb-1">
                                                                        Attn: <span className="uppercase">{invoice.client}</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="uppercase mb-1">{invoice.client}</div>
                                                        )}
                                                        {invoice.address ? invoice.address.split(',').map((line, idx) => (
                                                            <div key={idx}>{line.trim()}</div>
                                                        )) : (
                                                            <>
                                                                <div>{invoice.address || "Doha, Qatar"}</div>
                                                            </>
                                                        )}
                                                        {invoice.contactNumber ? (
                                                            <div className="mt-1">Contact: {invoice.contactNumber}</div>
                                                        ) : (
                                                            invoice.tel && <div className="mt-1">Contact: {invoice.tel}</div>
                                                        )}
                                                        {!invoice.address && <div>Doha, Qatar</div>}
                                                    </div>

                                                    <div className="border border-black p-2 text-[11px] font-bold flex items-center h-8 font-serif uppercase">
                                                        ATTN: {invoice.attn || "Finance Department"}
                                                    </div>
                                                </div>

                                                {/* Right Column */}
                                                <div className="w-1/2 flex flex-col justify-between">
                                                    <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                                        <tbody>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2 w-1/3">INV No:</td>
                                                                <td className="border border-black p-1 text-center">{invoice.invoiceNo}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2">Delivery Note:</td>
                                                                <td className="border border-black p-1 text-center">{invoice.deliveryNote || "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2">Order Number</td>
                                                                <td className="border border-black p-1 text-center">{invoice.lpoNo || invoice.refNo || "N/A"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2">DATE :</td>
                                                                <td className="border border-black p-1 text-center">
                                                                    {new Date(invoice.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                                        <tbody>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2 w-1/3">SALESMAN :</td>
                                                                <td className="border border-black p-1 text-center">{invoice.salesman || "-"}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                                        <tbody>
                                                            <tr>
                                                                <td className="border border-black p-1 pl-2 w-1/3">Project :</td>
                                                                <td className="border border-black p-1 text-center uppercase">{invoice.project || invoice.client}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Blank Separator Blocks */}
                                            <div className="border border-black h-8 mt-2"></div>
                                            <div className="border-l border-r border-b border-black h-12"></div>

                                             {/* Main Table */}
                                            <table className="w-full border-collapse border border-black text-[11px] font-serif table-fixed">
                                                <thead>
                                                    <tr className="font-bold">
                                                        <th className="border border-black p-1 w-[8%] text-center uppercase font-bold text-[10px]">SL. NO.</th>
                                                        <th className="border border-black p-1 w-[47%] text-center uppercase font-bold text-[10px]">Description</th>
                                                        <th className="border border-black p-1 w-[10%] text-center uppercase font-bold text-[10px]">UOM</th>
                                                        <th className="border border-black p-1 w-[10%] text-center uppercase font-bold text-[10px]">QTY</th>
                                                        <th className="border border-black p-1 w-[12%] text-center uppercase font-bold text-[10px]">UNIT PRICE</th>
                                                        <th className="border border-black p-1 w-[13%] text-center uppercase font-bold text-[10px]">TOTAL AMOUNT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.length > 0 ? items.map((item, idx: number) => (
                                                        <tr key={idx} className="align-top font-bold text-[11px]">
                                                            <td className="border border-black p-1 text-center h-20 pt-2">{idx + 1}</td>
                                                            <td className="border border-black p-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] pt-2 px-2 text-[10px]">{item.description}</td>
                                                            <td className="border border-black p-1 text-center uppercase pt-2">{item.uom || "Nos"}</td>
                                                            <td className="border border-black p-1 text-center pt-2">{item.quantity}</td>
                                                            <td className="border border-black p-1 text-center uppercase pt-2">{item.unitPrice === 0 ? "LUMPSUM" : Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="border border-black p-1 text-right pt-2 pr-2">{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr className="h-20 font-bold">
                                                            <td className="border border-black p-1"></td>
                                                            <td className="border border-black p-1"></td>
                                                            <td className="border border-black p-1"></td>
                                                            <td className="border border-black p-1"></td>
                                                            <td className="border border-black p-1"></td>
                                                            <td className="border border-black p-1"></td>
                                                        </tr>
                                                    )}
                                                    {/* Total Row */}
                                                    <tr className="font-bold border border-black text-[11px]">
                                                        <td className="border-r border-black p-1 pl-2">Total</td>
                                                        <td colSpan={4} className="border-r border-black p-1 text-center uppercase px-4">
                                                            {numberToWords(balance)}
                                                        </td>
                                                        <td className="p-1 pr-2 text-right">
                                                            {Number(balance).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="border border-black text-[10px] flex h-40 font-serif relative mt-6">
                                        <div className="p-2 w-[55%] font-bold flex flex-col justify-between">
                                            <div>
                                                <div className="mb-0.5">Beneficiary Name: DESIGN ELEMENTS TRADING AND CONTRACTING</div>
                                                <div className="mb-0.5">Account No: 0260-483896-001</div>
                                                <div className="mb-0.5">SWIFT: QNBAQAQAXXX</div>
                                                <div className="flex">
                                                    <div className="w-12">IBAN:</div>
                                                    <div className="font-black text-gray-800">QA86QNBA00000000260483896001</div>
                                                </div>
                                                <div className="flex">
                                                    <div className="w-16">Bank Name:</div>
                                                    <div className="font-black text-gray-800">QATAR NATIONAL BANK</div>
                                                </div>
                                            </div>
                                            <div className="mt-auto flex items-end mb-2">
                                                <div className="uppercase tracking-widest text-[11px]">FOR : DESIGN ELEMENTS</div>
                                            </div>
                                        </div>

                                        {/* Signatures Area */}
                                        <div className="w-[45%] relative p-2 flex flex-col justify-end items-end">
                                            <div className="flex flex-col items-center mr-6 z-10 relative mb-2">
                                                <div className="uppercase font-bold text-[11px] tracking-wider">RECEIVER SIGNATURE</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Decorative Bottom Bar */}
                <div className="h-4 bg-gray-200 w-full flex justify-start -mt-2">
                    <div className="w-1/4 h-full bg-gray-600 transform -skew-x-12 origin-top-left"></div>
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
                        display: block !important;
                    }
                    .print-doc-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .print-doc-table thead {
                        display: table-header-group !important;
                    }
                    .print-doc-table tfoot {
                        display: table-footer-group !important;
                    }
                    .print-doc-table tbody tr {
                        page-break-inside: avoid !important;
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
