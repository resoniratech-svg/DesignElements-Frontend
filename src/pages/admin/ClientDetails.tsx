import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Edit2,
    FileText,
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    Shield,
    Calendar,
    CreditCard,
    Hash,
    ScrollText,
    Paperclip
} from "lucide-react";
import PageLoader from "../../components/PageLoader";
import StatusBadge from "../../components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { getUploadUrl } from "../../services/api";
import { clientService } from "../../services/clientService";
import dayjs from "dayjs";

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: client, isLoading } = useQuery({
        queryKey: ["client", id],
        queryFn: () => clientService.getClient(id!)
    });

    if (isLoading) {
        return <PageLoader message="Loading Client Profile..." />;
    }

    if (!client) {
        return <div className="p-6 text-center text-slate-500">Client not found.</div>;
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 bg-white rounded-full transition-colors shadow-sm shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{client.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs sm:text-base text-slate-500 truncate">{client.companyName}</p>
                            {client.clientCode && (
                                <span className="bg-brand-50 text-brand-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-100 uppercase tracking-wider">
                                    {client.clientCode}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/edit-client/${id}`)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all font-semibold shadow-sm text-sm"
                >
                    <Edit2 size={16} /> Edit Profile
                </button>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <User size={18} className="text-brand-600" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><User size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contact Person</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.contactPerson || client.name || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Building2 size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Company</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.companyName || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Mail size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.email || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Phone size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.phone || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Shield size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Division</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.division || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Hash size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Client ID</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.id}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Address</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{client.address || "No address recorded."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <FileText size={18} className="text-brand-600" /> Business Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-1">Qatar ID (QID)</p>
                            <p className="font-semibold text-slate-700 text-lg">{client.qid || "Not Provided"}</p>
                        </div>
                        {client.qidDocUrl && (
                            <a
                                href={getUploadUrl(client.qidDocUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm"
                                title="View QID Document"
                            >
                                <Paperclip size={16} />
                            </a>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-1">CR Number</p>
                            <p className="font-semibold text-slate-700 text-lg">{client.crNumber || "Not Provided"}</p>
                        </div>
                        {client.crDocUrl && (
                            <a
                                href={getUploadUrl(client.crDocUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm"
                                title="View CR Document"
                            >
                                <Paperclip size={16} />
                            </a>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-1">Computer Card</p>
                            <p className="font-semibold text-slate-700 text-lg">{client.computerCard || "Not Provided"}</p>
                        </div>
                        {client.computerCardDocUrl && (
                            <a
                                href={getUploadUrl(client.computerCardDocUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm"
                                title="View Computer Card Document"
                            >
                                <Paperclip size={16} />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Licenses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <ScrollText size={18} className="text-brand-600" /> Licenses
                </h3>
                {client.licenses && client.licenses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {client.licenses.map((license: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative group">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">License Type</p>
                                    <p className="font-semibold text-slate-700">{license.licenseType || license.licenseName || "General License"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">License Number</p>
                                    <p className="font-semibold text-brand-600 font-mono">{license.licenseNumber || license.licenseName || "N/A"}</p>
                                </div>
                                {license.expiryDate && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Expiry Date</p>
                                        <p className="font-semibold text-slate-700">{dayjs(license.expiryDate).format("DD MMM, YYYY")}</p>
                                    </div>
                                )}
                                {license.documentUrl && (
                                    <a
                                        href={getUploadUrl(license.documentUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-brand-600 hover:text-brand-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        title="View License Document"
                                    >
                                        <Paperclip size={14} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm italic">No licenses recorded.</p>
                )}
            </div>

            {/* Contract Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <CreditCard size={18} className="text-brand-600" /> Contract Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg"><FileText size={16} className="text-slate-400" /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contract Type</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">{client.contractType || "N/A"}</p>
                                </div>
                            </div>
                            {client.contractDocUrl && (
                                <a
                                    href={getUploadUrl(client.contractDocUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 hover:border-brand-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                    <Paperclip size={14} /> View Contract
                                </a>
                            )}
                        </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Start Date</p>
                            <p className="font-semibold text-slate-800 mt-0.5">
                                {client.startDate ? dayjs(client.startDate).format("DD MMM, YYYY") : "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={16} className="text-slate-400" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Renewal Date</p>
                            <p className="font-semibold text-slate-800 mt-0.5">
                                {client.renewalDate ? dayjs(client.renewalDate).format("DD MMM, YYYY") : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attached Documents / Agreements */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <Paperclip size={18} className="text-brand-600" /> Attached Documents & Agreements
                </h3>
                {client.agreements && client.agreements.length > 0 ? (
                    <div className="space-y-3">
                        {client.agreements.map((agreement: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        <FileText size={18} className="text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{agreement.title}</p>
                                        <div className="flex gap-4 mt-1">
                                            {agreement.startDate && (
                                                <p className="text-[10px] text-slate-400">
                                                    Start: {dayjs(agreement.startDate).format("DD MMM, YYYY")}
                                                </p>
                                            )}
                                            {agreement.endDate && (
                                                <p className="text-[10px] text-slate-400">
                                                    End: {dayjs(agreement.endDate).format("DD MMM, YYYY")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {agreement.fileUrl && (
                                    <a
                                        href={getUploadUrl(agreement.fileUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
                                    >
                                        <Paperclip size={12} /> View File
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm italic">No documents or agreements attached.</p>
                )}
            </div>

            {/* Status Footer */}
            <div className="mt-6 flex items-center gap-3">
                <StatusBadge status="ACTIVE" />
                {client.creditLimit && (
                    <span className="text-xs text-slate-500 font-medium">
                        Credit Limit: <span className="font-bold text-slate-700">QAR {parseFloat(client.creditLimit).toLocaleString()}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
