import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Printer, Edit, Loader2 } from "lucide-react";
import { financeService } from "../../services/financeService";
// Removed unused Invoice import

export default function DeliveryNoteDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [invoice, setInvoice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                    setInvoice({
                        id: inv.id,
                        invoiceNo: inv.invoice_number,
                        client: inv.client_name || inv.client,
                        address: inv.address,
                        tel: inv.contact_number || inv.tel, // using contact_number if available
                        attn: "PROCUREMENT DEPARTMENT", // Hardcoded for DN layout
                        deliveryNote: inv.delivery_note,
                        dnDate: inv.dn_date,
                        dnPreparedBy: inv.dn_prepared_by,
                        dnCheckedBy: inv.dn_checked_by,
                        dnReceiverName: inv.dn_receiver_name,
                        orderNumber: inv.lpo_no || inv.reference_number || "N/A",
                        date: inv.invoice_date,
                        salesman: inv.salesman,
                        project: inv.project_name || inv.client_name,
                        refNo: inv.reference_number,
                        items: items
                    });

                    // Check for print parameter
                    const searchParams = new URLSearchParams(location.search);
                    if (searchParams.get("print") === "true") {
                        setTimeout(() => {
                            window.print();
                        }, 800);
                    }
                } else {
                    setError("Invoice/Delivery Note data not found");
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load data");
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
                <p className="text-slate-500 font-medium">Loading Delivery Note...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="text-red-500 font-bold">{error || "Delivery Note not found."}</div>
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

    // Use dnDate if set, otherwise fallback to invoice date
    const displayDate = invoice.dnDate ? new Date(invoice.dnDate) : new Date(invoice.date);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Delivery Note: {invoice.deliveryNote || "Draft"}</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate(`/edit-delivery-note/${id}`)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition">
                        <Edit size={16} />
                        Edit DN Details
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
                        <Printer size={16} />
                        Print / Download PDF
                    </button>
                </div>
            </div>

            {/* NEW DELIVERY NOTE DESIGN (EXACT MATCH) */}
            <div className="max-w-[900px] mx-auto bg-white font-serif text-black print:m-0 print:w-full border-t border-b-0 border-white relative min-h-[1000px] flex flex-col">
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
                            <span className="text-[10px] text-gray-400 font-bold text-right mt-1">ديسين المنتس للتجارة والمقاولات ذ.م.م</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col flex-1">
                    {/* Title Box */}
                    <div className="border border-black border-collapse mb-4 mt-2 h-8 flex items-center justify-center">
                        <h1 className="font-bold tracking-widest text-[14px] uppercase underline decoration-2 underline-offset-4">DELIVERY NOTE</h1>
                    </div>

                    <div className="flex flex-col">
                        {/* Two Column Layout */}
                        <div className="flex justify-between gap-4 h-48">
                            {/* Left Column */}
                            <div className="w-1/2 flex flex-col justify-between">
                                <div className="border border-black p-2 text-[11px] h-32 flex flex-col font-bold font-serif leading-tight">
                                    <div className="uppercase mb-1">{invoice.client}</div>
                                    {invoice.address ? invoice.address.split(',').map((line: string, idx: number) => (
                                        <div key={idx}>{line.trim()}</div>
                                    )) : (
                                        <>
                                            <div>{invoice.address || "Doha, Qatar"}</div>
                                        </>
                                    )}
                                    {invoice.tel && <div className="mt-1">Contact: {invoice.tel}</div>}
                                    {!invoice.address && <div>Doha, Qatar</div>}
                                </div>
                                
                                <div className="border border-black p-2 text-[11px] font-bold flex items-center h-8 font-serif uppercase">
                                    ATTN: {invoice.attn}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="w-1/2 flex flex-col justify-between">
                                <table className="w-full border-collapse border border-black text-[11px] font-serif font-bold">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-1 pl-2 w-1/3">DN No:</td>
                                            <td className="border border-black p-1 text-center">{invoice.deliveryNote || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 pl-2">Order Number</td>
                                            <td className="border border-black p-1 text-center">{invoice.orderNumber}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 pl-2">DATE :</td>
                                            <td className="border border-black p-1 text-center">
                                                {displayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                                            <td className="border border-black p-1 text-center uppercase">{invoice.project}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 pl-2">Ref #:</td>
                                            <td className="border border-black p-1 text-center">{invoice.refNo || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Blank Separator Blocks */}
                        <div className="border border-black h-8 mt-2"></div>
                        <div className="border-l border-r border-b border-black h-12"></div>

                        {/* Main Table */}
                        <table className="w-full border-collapse border border-black text-[11px] font-serif flex-1">
                            <thead>
                                <tr className="font-bold">
                                    <th className="border border-black p-1 w-[10%] text-center uppercase font-bold text-[10px]">SL. NO.</th>
                                    <th className="border border-black p-1 w-[50%] text-center uppercase font-bold text-[10px]">PART NUMBER, MAKE/BRAND</th>
                                    <th className="border border-black p-1 w-[20%] text-center uppercase font-bold text-[10px]">UOM</th>
                                    <th className="border border-black p-1 w-[20%] text-center uppercase font-bold text-[10px]">QUANTITY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, idx: number) => (
                                    <tr key={idx} className="h-10 align-top">
                                        <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                                        <td className="border border-black p-1 text-center font-bold">{item.description}</td>
                                        <td className="border border-black p-1 text-center font-bold">Nos</td>
                                        <td className="border border-black p-1 text-center font-bold">{item.quantity}</td>
                                    </tr>
                                ))}
                                {/* Fill remaining empty space */}
                                <tr className="h-48 border border-black border-t-0">
                                    <td className="border border-black border-t-0"></td>
                                    <td className="border border-black border-t-0"></td>
                                    <td className="border border-black border-t-0"></td>
                                    <td className="border border-black border-t-0"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures Area */}
                    <div className="mt-4 border border-black flex h-32 text-[10px] font-bold relative">
                        {/* Prepared By */}
                        <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between">
                            <div>Prepared by: {invoice.dnPreparedBy}</div>
                        </div>

                        {/* Checked By */}
                        <div className="w-1/3 border-r border-black p-2 flex flex-col justify-between relative">
                            <div>Checked By: {invoice.dnCheckedBy}</div>
                            {/* Simulated Stamp/Signature if checked by is present */}
                            {invoice.dnCheckedBy && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none transform -rotate-12">
                                    <div className="text-blue-600 border-2 border-blue-600 rounded-full w-24 h-24 flex items-center justify-center relative">
                                        <div className="absolute top-2 text-[6px] tracking-widest text-center leading-tight">DESIGN ELEMENTS</div>
                                        <div className="text-center">
                                            <span className="text-[14px] block font-signature">Athar</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Receiver Area */}
                        <div className="w-1/3 p-2 flex flex-col">
                            <div className="border-b border-black pb-4 mb-2">
                                Receiver's Name: <span className="font-normal">{invoice.dnReceiverName}</span>
                            </div>
                            <div>Signature:</div>
                        </div>
                    </div>

                </div>

                {/* Footer Section */}
                <div className="h-24 flex flex-col items-center justify-end pb-4 font-serif text-[10px] text-gray-500 font-bold bg-white z-10 w-full mt-auto no-print">
                    <div className="flex items-center gap-2 uppercase tracking-wide">
                        <span>CR No: 211686</span>
                        <span>|</span>
                        <span>+974 70122772</span>
                        <span>|</span>
                        <span>Doha - Qatar</span>
                    </div>
                    <div className="flex items-center gap-2 tracking-wide mt-1">
                        <span>info@designelementsqatar.com</span>
                        <span>|</span>
                        <span>www.designelementsqatar.com</span>
                    </div>
                </div>

                <div className="hidden print:flex h-24 flex-col items-center justify-end pb-4 font-serif text-[10px] text-gray-500 font-bold absolute bottom-0 left-0 right-0 w-full">
                     <div className="flex items-center gap-2 uppercase tracking-wide">
                        <span>CR No: 211686</span>
                        <span>|</span>
                        <span>+974 70122772</span>
                        <span>|</span>
                        <span>Doha - Qatar</span>
                    </div>
                    <div className="flex items-center gap-2 tracking-wide mt-1">
                        <span>info@designelementsqatar.com</span>
                        <span>|</span>
                        <span>www.designelementsqatar.com</span>
                    </div>
                </div>

            </div>

        </div>
    );
}
