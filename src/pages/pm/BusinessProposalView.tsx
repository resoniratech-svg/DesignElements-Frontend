import React from 'react';
import type { Quotation } from '../../types/pm';

interface BusinessProposalViewProps {
    quotation: Quotation;
}

const BusinessProposalView: React.FC<BusinessProposalViewProps> = ({ quotation }) => {
    const clientName = quotation.client || "Client Name";

    return (
        <div className="flex flex-col gap-10 bg-slate-200 p-10 items-center">
            {/* Page 1: Cover */}
            <div className="w-[794px] h-[1123px] bg-[#f4f1ea] shadow-2xl relative overflow-hidden flex flex-col p-16 font-serif select-none print-page">
                <header className="flex justify-between items-start mb-20">
                    <div className="flex flex-col">
                        <span className="text-[10px] tracking-[0.2em] font-sans uppercase opacity-50 mb-1">DESIGN ELEMENTS TRADING CONTRACTING AND SERVICES</span>
                        <span className="text-sm tracking-[0.3em] font-sans uppercase font-bold text-black">Design Elements</span>
                    </div>
                    <div className="w-12 h-[1px] bg-black opacity-20"></div>
                </header>

                <main className="flex-1 flex flex-col justify-center">
                    <h1 className="text-[120px] leading-[0.9] font-light text-black tracking-tight mb-4">
                        Business<br />Proposal
                    </h1>
                    <div className="w-16 h-1 bg-black mb-10"></div>
                </main>

                <footer className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest opacity-60 font-sans">Prepared for :</p>
                        <p className="text-2xl font-medium tracking-tight uppercase">{clientName}</p>
                        <div className="w-8 h-[1px] bg-black pt-4"></div>
                    </div>
                    <div className="text-[100px] leading-[0.8] font-light opacity-10 flex flex-col">
                        <span>20</span>
                        <span>26</span>
                    </div>
                </footer>

                {/* Decorative dots / lines */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-20">
                    <div className="w-[1px] h-32 bg-black"></div>
                    <div className="w-3 h-3 rounded-full border border-black"></div>
                    <div className="w-[1px] h-32 bg-black"></div>
                </div>
            </div>

            {/* Page 2: About Us */}
            <div className="w-[794px] h-[1123px] bg-white shadow-2xl flex flex-col overflow-hidden font-sans print-page">
                <div className="h-1/3 bg-[#1a1a1a] relative flex items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                        alt="Workspace"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute top-10 left-16 text-white text-xs tracking-[0.3em] uppercase opacity-80">design elements</div>
                </div>

                <div className="flex-1 p-20 flex flex-col items-center justify-center text-center">
                    <h2 className="text-7xl font-serif italic mb-12 text-[#1a1a1a]">About Us</h2>
                    <p className="text-lg leading-relaxed text-slate-600 max-w-2xl whitespace-pre-wrap">
                        {quotation.aboutUs || "Design Elements is a trusted provider of comprehensive corporate and industrial setup solutions in Qatar. We specialize in guiding investors and entrepreneurs through every stage of company formation, licensing, and operational setup, ensuring compliance with all local laws and regulations. Our expertise extends to supporting industrial projects with end-to-end documentation, approvals, and advisory services."}
                    </p>
                </div>

                <footer className="p-16 flex justify-between items-end">
                    <div>
                        <div className="w-10 h-[2px] bg-black mb-2"></div>
                        <p className="text-sm font-bold uppercase tracking-widest">Doha - Qatar</p>
                    </div>
                    <div className="text-5xl font-serif italic opacity-10">2026</div>
                </footer>
            </div>

            {/* Page 3: What We Do? */}
            <div className="w-[794px] h-[1123px] bg-[#f4f1ea] shadow-2xl flex relative overflow-hidden font-sans print-page">
                <div className="w-1/2 p-20 flex flex-col justify-center">
                    <h2 className="text-7xl font-serif tracking-tighter leading-tight mb-12 text-[#1a1a1a]">What<br />We Do?</h2>

                    <p className="text-md font-medium text-slate-700 mb-8 border-l-2 border-black pl-4">
                        We provide professional services for the establishment and licensing of businesses in Qatar, including:
                    </p>

                    <ul className="space-y-6 text-slate-600">
                        {(quotation.whatWeDo || "Company formation and trade license registration\nIndustrial license applications and approvals\nGovernment liaison and PRO services\nSpecial approval coordination for industrial projects\nComprehensive project documentation and compliance").split('\n').filter((l: string) => l.trim()).map((item: string, i: number) => (
                            <li key={i} className="flex gap-4 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200"
                        alt="Documentation"
                        className="w-full h-full object-cover grayscale brightness-75"
                    />
                    <div className="absolute bottom-16 right-16 text-white text-5xl font-serif italic opacity-60">2026</div>
                    <div className="absolute bottom-16 left-10 text-white text-xs uppercase tracking-widest opacity-60 origin-bottom-left -rotate-90">Doha - Qatar</div>
                </div>
            </div>

            {/* Page 4: Our Proposal */}
            <div className="w-[794px] h-[1123px] bg-white shadow-2xl p-20 flex flex-col font-sans print-page">
                <header className="flex justify-between items-center mb-24">
                    <div className="text-xs tracking-[0.3em] uppercase opacity-40">design elements</div>
                    <div className="w-12 h-[1px] bg-black opacity-20"></div>
                </header>

                <h2 className="text-8xl font-serif mb-16 tracking-tighter">Our Proposal</h2>

                <div className="flex-1 overflow-y-auto">
                    <div className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                        {quotation.proposalIntro || "Design Elements proposes to manage the complete setup of a new company in Qatar."}
                    </div>
                </div>

                <footer className="mt-auto flex justify-between items-end">
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Doha - Qatar</p>
                    <div className="text-6xl font-serif italic opacity-5">2026</div>
                </footer>
            </div>

            {/* Page 5: Financial Terms */}
            <div className="w-[794px] h-[1123px] bg-[#fdfaf5] shadow-2xl p-20 flex flex-col font-sans border-t-[20px] border-[#1a1a1a] print-page">
                <h2 className="text-5xl font-serif mb-16 leading-tight">Financial &<br />Commercial Terms</h2>

                <div className="bg-[#1a1a1a] text-white p-12 rounded-sm mb-12 relative">
                    <p className="text-sm uppercase tracking-widest opacity-60 mb-2">Company Formation Package</p>
                    <h3 className="text-4xl font-bold mb-4">QAR {parseFloat(String(quotation.netTotal || 11000)).toLocaleString()}</h3>
                    <p className="text-xs opacity-60 italic">(Service Fees + Government Charges | All-inclusive)</p>
                    <div className="absolute top-0 right-0 p-8 text-6xl font-serif opacity-10 select-none italic font-light">Design</div>
                </div>

                <div className="flex-1">
                    <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                        {quotation.financialTerms || "Total Package Cost: QAR 11,000 (all-inclusive)..."}
                    </div>
                </div>

                <footer className="mt-auto flex justify-end opacity-20">
                    <span className="text-7xl font-serif italic">2026</span>
                </footer>
            </div>

            {/* Page 6: Duties & Payments */}
            <div className="w-[794px] h-[1123px] bg-white shadow-2xl p-20 flex flex-col font-sans border-r-[15px] border-[#f4f1ea] print-page">
                <div className="grid grid-cols-2 gap-20 h-full">
                    <div className="space-y-12 h-full overflow-hidden flex flex-col">
                        <h2 className="text-4xl font-serif border-b pb-4">Client Duties</h2>
                        <div className="text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed flex-1 italic overflow-y-auto">
                            {quotation.clientDuties || "1. Provide required documents..."}
                        </div>
                    </div>

                    <div className="space-y-12 bg-slate-50 p-10 -mr-20 -my-20 flex flex-col justify-between overflow-hidden">
                        <div className="pt-20">
                            <h2 className="text-4xl font-serif border-b pb-4">Payment Terms</h2>
                            <div className="mt-10 text-[13px] font-medium whitespace-pre-wrap leading-relaxed italic">
                                {quotation.paymentTerms || "50% advance payment..."}
                            </div>
                        </div>

                        <div className="text-8xl font-serif italic text-slate-100 select-none pb-10">2026</div>
                    </div>
                </div>
            </div>

            {/* Page 7: Thank You */}
            <div className="w-[794px] h-[1123px] bg-[#1a1a1a] shadow-2xl relative flex flex-col items-center justify-center text-center text-white font-sans print-page">
                <div className="absolute top-16 left-16 text-xs tracking-[0.4em] uppercase opacity-40">design elements</div>

                <h2 className="text-[120px] font-serif font-light leading-none mb-4 italic">Thank You</h2>
                <div className="w-20 h-1 bg-white mb-16 opacity-30"></div>

                <p className="text-2xl font-serif italic mb-20 opacity-80">Let's connect with us!</p>

                <div className="grid grid-cols-2 gap-x-20 gap-y-12 text-left max-w-xl">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[.3em] opacity-40">Contact us</p>
                        <p className="text-sm font-medium">+974 3051 6559</p>
                        <p className="text-sm font-medium">+974 3005 6030</p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-[10px] uppercase tracking-[.3em] opacity-40">Email</p>
                        <p className="text-sm font-medium">info@designelementsqatar.com</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[.3em] opacity-40">Website</p>
                        <p className="text-sm font-medium">www.designelementsqatar.com</p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-[10px] uppercase tracking-[.3em] opacity-40">Location</p>
                        <p className="text-sm font-medium">Doha - Qatar</p>
                    </div>
                </div>

                <div className="absolute bottom-16 w-full flex justify-center opacity-10">
                    <span className="text-[180px] font-serif leading-none italic font-light">2026</span>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Outfit:wght@300;400;700&display=swap');
                
                .font-serif { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Outfit', sans-serif; }

                @media print {
                    .no-print { display: none !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .bg-slate-200 { background: none !important; padding: 0 !important; }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page { 
                        size: A4 portrait; 
                        margin: 10mm; 
                    }
                    .print-page { 
                        break-after: page; 
                        margin: 0 auto !important; 
                        box-shadow: none !important; 
                        border: none !important; 
                        width: 210mm !important; 
                        max-width: 100% !important;
                        height: 297mm !important; 
                        display: block !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BusinessProposalView;
