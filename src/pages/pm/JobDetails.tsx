import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { ArrowLeft, CheckCircle, Clock, FileText, User } from "lucide-react";

function JobDetails() {
    const { id = "JOB-001" } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-2 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <PageHeader showBack
                title={`Job Details: ${id}`}
                subtitle="Project scope, milestones, and personnel management"
                action={
                    <div className="flex gap-3">
                        <button className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Edit Job
                        </button>
                        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
                            Complete Job
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Service Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Service Type</p>
                                <p className="text-sm text-gray-700 font-medium">Visa Renewal / Construction Support</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                                <div className="mt-1">
                                    <StatusBadge status="Under Process" />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 font-semibold uppercase">Description</p>
                                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                    Standard service request for processing renewal and related documentation.
                                    Ensuring all local regulations and timelines are met as per the project schedule.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Job Milestones</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Document Collection", status: "Completed", date: "Mar 01, 2026" },
                                { name: "Submission to Authorities", status: "Under Process", date: "Mar 05, 2026" },
                                { name: "Final Approval", status: "Pending", date: "Est. Mar 15, 2026" },
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {m.status === 'Completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{m.name}</p>
                                            <p className="text-[10px] text-gray-400">{m.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{m.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Personnel</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Mohamed Ahmed</p>
                                    <p className="text-xs text-gray-400">Project Executive</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Job Documents</h3>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/job-documents')} className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400 group-hover:text-brand-600" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">View Documents</span>
                                </div>
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">4</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetails;
