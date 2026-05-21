import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import type { Proposal, ProposalActivity } from "../../types/pm";

// UI Helper Components
const TopNav = () => (
    <div className="flex justify-between items-center w-full mb-16 px-4">
        <span className="font-serif text-[18px] tracking-wide text-[#2a2a2a] lowercase">Design elements</span>
        <span className="text-[#2a2a2a]">⟶</span>
    </div>
);

const Footer = ({ year }: { year?: string }) => (
    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end font-sans">
        <div>
            <div className="w-10 h-[1.5px] bg-[#2a2a2a] mb-2"></div>
            <span className="text-[#2a2a2a] text-[15px] font-medium">Doha -Qatar</span>
        </div>
        <span className="font-serif text-[42px] leading-none text-[#2a2a2a] tracking-tight">{year || "2026"}</span>
    </div>
);

export default function ProposalDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [proposal, setProposal] = useState<Proposal | null>(null);

    const hasFullAccess = user?.role === "SUPER_ADMIN" || user?.role === "PROJECT_MANAGER";

    useEffect(() => {
        const persistedProposals: Proposal[] = JSON.parse(localStorage.getItem("trek_proposals") || "[]");
        const found = persistedProposals.find((p) => p.id === id);
        if (found) {
            setProposal(found);
        }
    }, [id]);

    if (!proposal) {
        return (
            <div className="p-6 text-center">
                <p>Proposal not found.</p>
                <button onClick={() => navigate("/proposals")} className="text-brand-600 mt-4 underline">
                    Back to Proposals
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const darkImagePlaceholder = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop";

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print max-w-[850px] mx-auto px-1 sm:px-0">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white bg-slate-200 rounded-full transition-colors shadow-sm shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{proposal.proposalNo}</h1>
                    </div>
                    <StatusBadge status={proposal.status} />
                </div>
                <div className="flex gap-2 sm:gap-3">
                    {hasFullAccess && (
                        <button onClick={() => navigate(`/edit-proposal/${id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border bg-white rounded-lg hover:bg-slate-50 transition shadow-sm font-medium text-xs sm:text-sm">
                            <Edit size={14} /> Edit
                        </button>
                    )}
                    <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-black transition shadow-sm font-medium text-xs sm:text-sm">
                        <Printer size={14} /> Print / PDF
                    </button>
                </div>
            </div>

            {/* A4 Document Container with horizontal scroll for mobile */}
            <div className="overflow-x-auto pb-8 sm:pb-0 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="w-[850px] mx-auto shadow-2xl border border-slate-300 print:shadow-none print:border-none print:m-0 font-sans text-[#2a2a2a] bg-[#EDE8DF]">

                {/* --- PAGE 1: COVER PAGE --- */}
                <div className="page-break w-full h-[1122px] p-16 relative overflow-hidden flex flex-col bg-[#EFECE5]">
                    {/* Top Text */}
                    <div className="flex justify-between items-center w-full mb-12">
                        <span className="font-serif text-[20px] tracking-wide text-[#2a2a2a] lowercase">Design elements</span>
                        <span className="text-[#2a2a2a] text-xl">⟶</span>
                    </div>

                    {/* Giant Title */}
                    <h1 className="font-serif text-[100px] leading-[0.9] text-[#1a1a1a] tracking-tighter mb-12 mt-8 z-10">
                        Business <br /> Proposal
                    </h1>

                    {/* Circle Graphic on left */}
                    <div className="absolute left-24 top-[40%] h-64 flex flex-col items-center">
                        <div className="w-[1.5px] h-20 bg-[#555]"></div>
                        <div className="relative w-10 h-10 my-1">
                            <div className="absolute top-2 left-1 w-8 h-8 rounded-full bg-[#555]"></div>
                            <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-white z-10 shadow-sm"></div>
                        </div>
                        <div className="w-[1.5px] h-32 bg-[#555]"></div>
                    </div>

                    {/* Hero Image Right */}
                    <div className="absolute right-0 bottom-48 w-[75%] h-[400px]">
                        <img src={darkImagePlaceholder} alt="Hero" className="w-full h-full object-cover brightness-[0.4] grayscale contrast-125" />
                    </div>

                    {/* Footer Cover */}
                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end">
                        <div className="pl-8">
                            <p className="text-[17px] font-bold text-[#2a2a2a] mb-2">Prepared for :</p>
                            <p className="text-[24px] font-serif text-[#1a1a1a] uppercase">{proposal.preparedFor || proposal.clientName}</p>
                            <div className="w-12 h-[1.5px] bg-[#2a2a2a] mt-4"></div>
                        </div>
                        <div className="font-serif text-[110px] leading-[0.75] text-[#1a1a1a] tracking-tighter text-right flex flex-col">
                            <span>{proposal.year.substring(0, 2)}</span>
                            <span>{proposal.year.substring(2, 4)}</span>
                        </div>
                    </div>
                </div>

                {/* --- PAGE 2: ABOUT US --- */}
                <div className="page-break w-full h-[1122px] flex flex-col relative overflow-hidden bg-white">
                    <div className="p-16 pb-0 absolute top-0 w-full z-10">
                        <TopNav />
                    </div>
                    {/* Top Image Split */}
                    <div className="h-[45%] w-full relative">
                        <img src={darkImagePlaceholder} alt="About" className="w-full h-full object-cover brightness-[0.3] grayscale" />
                    </div>
                    {/* Cream bridging band */}
                    <div className="bg-[#EFECE5] py-10 w-full flex justify-center items-center">
                        <h2 className="font-serif text-[90px] text-[#1a1a1a] tracking-tight">About Us</h2>
                    </div>
                    {/* White text area */}
                    <div className="flex-1 bg-white p-20 flex flex-col justify-center relative">
                        <p className="text-[19px] leading-[2.2] text-[#4a4a4a] text-justify tracking-wide">
                            {proposal.aboutCompany}
                        </p>
                        <Footer year={proposal.year} />
                    </div>
                </div>

                {/* --- PAGE 3: WHAT WE DO? --- */}
                <div className="page-break w-full h-[1122px] flex relative overflow-hidden bg-[#EFECE5]">
                    {/* Left Column */}
                    <div className="w-[55%] h-full p-16 flex flex-col relative z-10">
                        <TopNav />

                        <div className="mt-12 flex-1">
                            <h2 className="font-serif text-[90px] leading-[0.9] text-[#1a1a1a] tracking-tight mb-12">
                                What<br />We Do?
                            </h2>
                            <p className="text-[18px] leading-[1.8] text-[#4a4a4a] mb-8 font-medium">
                                We provide professional services for the establishment and licensing of businesses in Qatar, including:
                            </p>
                            <ul className="space-y-5 text-[17px] text-[#4a4a4a] leading-relaxed ml-2">
                                {proposal.services?.map((service: string, idx: number) => (
                                    <li key={idx} className="flex gap-4">
                                        <span className="text-xl mt-[-2px]">•</span>
                                        <span>{service}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Footer year={proposal.year} />
                    </div>
                    {/* Right Image */}
                    <div className="w-[45%] h-full">
                        <img src={darkImagePlaceholder} alt="Services" className="w-full h-full object-cover brightness-[0.4] grayscale" />
                    </div>
                </div>

                {/* --- PAGE 4: OUR PROPOSAL --- */}
                <div className="page-break w-full h-[1122px] p-16 flex flex-col relative overflow-hidden bg-[#EFECE5]">
                    <TopNav />
                    <h2 className="font-serif text-[90px] leading-[0.9] text-[#1a1a1a] tracking-tight mb-12">
                        Our Proposal
                    </h2>
                    <div className="text-[18px] leading-[2] text-[#333] space-y-8 pr-12 font-medium">
                        <p className="whitespace-pre-wrap">{proposal.proposalDescription}</p>

                        <div className="space-y-6 pt-4">
                            {proposal.activities?.map((activity: ProposalActivity, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="font-black text-[#1a1a1a] text-[19px] leading-snug">{activity.title}</h3>
                                    <p className="text-[#4a4a4a] text-[17px] font-normal leading-[1.8] text-justify">
                                        {activity.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Footer year={proposal.year} />
                </div>

                {/* --- PAGE 5: FINANCIAL TERMS --- */}
                <div className="page-break w-full h-[1122px] p-16 flex flex-col relative overflow-hidden bg-[#EFECE5]">
                    <TopNav />
                    <h2 className="font-serif text-[65px] leading-[1] text-[#1a1a1a] tracking-tight mb-16">
                        Financial & Commercial Terms
                    </h2>

                    <div className="text-[18px] leading-[2] text-[#333] space-y-6 pr-12 font-medium flex-1">
                        <p className="font-bold text-[20px]">{proposal.packageName}</p>
                        <p className="font-bold text-[20px]">
                            Total Package Cost: QAR {proposal.totalPackageCost} (all-inclusive)
                        </p>

                        <div className="pt-4">
                            <p className="mb-4">This charge includes:</p>
                            <ul className="space-y-4 ml-6 list-disc text-[#4a4a4a]">
                                {proposal.includedServices?.split('\n').map((item: string, i: number) => item.trim() && (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {(proposal.financialNotes || proposal.exclusions) && (
                            <div className="pt-20">
                                <p className="font-bold mb-2">Note:</p>
                                <p className="text-[#4a4a4a] text-justify leading-[1.8]">
                                    {proposal.financialNotes}
                                    {proposal.exclusions && `\n${proposal.exclusions}`}
                                </p>
                            </div>
                        )}
                    </div>
                    <Footer year={proposal.year} />
                </div>

                {/* --- PAGE 6: DUTIES & PAYMENT --- */}
                <div className="page-break w-full h-[1122px] p-16 flex flex-col relative overflow-hidden bg-[#EFECE5]">
                    <TopNav />

                    <div className="flex-1 mt-8 text-[17px] leading-[2] text-[#333] space-y-12 pr-12 font-medium">

                        {/* Client Duties */}
                        <div>
                            <h2 className="font-serif text-[45px] leading-[1] text-[#1a1a1a] tracking-tight mb-8">
                                Client Duties:
                            </h2>
                            <ul className="space-y-4 ml-6 list-disc text-[#4a4a4a]">
                                {proposal.clientDuties?.split('\n').map((item: string, i: number) => item.trim() && (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Payment Terms */}
                        <div className="pt-8">
                            <h2 className="font-serif text-[45px] leading-[1] text-[#1a1a1a] tracking-tight mb-8 mt-12">
                                Payment Terms:
                            </h2>
                            <ul className="space-y-4 ml-6 list-disc text-[#4a4a4a]">
                                {proposal.paymentTerms?.split('\n').map((item: string, i: number) => item.trim() && (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                    </div>
                    <Footer year={proposal.year} />
                </div>

                {/* --- PAGE 7: THANK YOU --- */}
                <div className="page-break w-full h-[1122px] p-16 flex flex-col relative overflow-hidden bg-[#EFECE5]">
                    <TopNav />

                    <div className="flex-1 flex flex-col mt-20">
                        <h2 className="font-serif text-[90px] leading-[0.9] text-[#1a1a1a] tracking-tight mb-8">
                            Thank You
                        </h2>

                        <p className="text-[32px] font-bold text-[#1a1a1a] mb-24">
                            Let's connect with us!
                        </p>

                        <div className="mt-8 space-y-6 text-[22px] text-[#2a2a2a] pl-2 border-l-[3px] border-[#2a2a2a]">
                            <p className="font-bold">Contact us:</p>
                            <p className="pl-6"><span className="font-bold">Mobile</span>: +974 3051 6559, +974 3005 6030</p>
                            <p className="pl-6"><span className="font-bold">Email</span>: info@designelementsqatar.com</p>
                            <p className="pl-6"><span className="font-bold">Website</span>: www.designelementsqatar.com</p>
                            <p className="pl-6 pt-4 font-bold flex flex-col">
                                <span>Location :</span>
                                <span className="font-medium mt-1">Doha -Qatar</span>
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-16 right-16">
                        <span className="font-serif text-[42px] leading-none text-[#2a2a2a] tracking-tight">{proposal.year || "2026"}</span>
                    </div>
                </div>

            </div>
        </div>

            <style>{`
        @media print {
          title { display: none; }
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .w-\\[850px\\] { width: 100% !important; max-width: none !important; border: none !important; box-shadow: none !important; }
          .bg-\\[\\#EFECE5\\] { background-color: #EFECE5 !important; }
          .bg-\\[\\#EDE8DF\\] { background-color: #EDE8DF !important; }
          .bg-\\[\\#1a1a1a\\] { background-color: #1a1a1a !important; color: white !important; }
          .bg-\\[\\#2a2a2a\\] { background-color: #2a2a2a !important; }
          .text-\\[\\#1a1a1a\\] { color: #1a1a1a !important; }
          .text-\\[\\#2a2a2a\\] { color: #2a2a2a !important; }
          .text-\\[\\#333\\] { color: #333 !important; }
          .text-\\[\\#4a4a4a\\] { color: #4a4a4a !important; }
          .page-break { 
            page-break-after: always;
            break-after: page;
            height: 1122px !important;
            min-height: 1122px !important;
            max-height: 1122px !important;
            box-sizing: border-box;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
        </div>
    );
}
