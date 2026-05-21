import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit2, User, FileText, Clock, Mail, Phone, MapPin, Briefcase, ExternalLink, AlertCircle } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import StatusBadge from "../../components/StatusBadge";
import { getDivisionById } from "../../constants/divisions";
import dayjs from "dayjs";
import { employeeService } from "../../services/employeeService";
import { getUploadUrl } from "../../services/api";
import type { Employee, EmployeeDocument } from "../../types/employee";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);

  // 1. Fetch Employee Record
  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id
  });

  if (isLoading) {
    return <PageLoader message="Accessing Secure Records..." />;
  }

  if (!employee) {
    return <div className="p-12 text-center text-gray-500 font-medium">Employee record not found.</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "activity", label: "Activity", icon: Clock },
  ];

  const getDocStatus = (expiryDate: string) => {
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    const diff = expiry.diff(today, "day");
    
    if (diff < 0) return { label: "EXPIRED", color: "bg-rose-100 text-rose-700 border-rose-200" };
    if (diff <= 30) return { label: "EXPIRING SOON", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "VALID", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 bg-white rounded-full transition-colors shadow-sm shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{employee.name}</h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-tight">ID: {employee.id}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/employees/edit/${employee.id}`)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm text-sm"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
              </div>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{employee.email || "N/A"}</p>
              </div>
          </div>
          <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone size={18} />
              </div>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{employee.phone}</p>
              </div>
          </div>
          <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Briefcase size={18} />
              </div>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Designation</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{employee.role}</p>
              </div>
          </div>
          <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
              </div>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Division</p>
                  <p className="font-semibold text-gray-800 text-sm truncate">{getDivisionById(employee.division).label}</p>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap ${isActive ? "border-brand-600 text-brand-600 bg-brand-50/10" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] animate-fade-in">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <User size={20} className="text-brand-500" /> Professional Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee Name</p>
                                <p className="text-gray-800 font-medium">{employee.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Staff ID</p>
                                <p className="text-gray-800 font-medium">{employee.id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Division</p>
                                <p className="text-gray-800 font-medium">{getDivisionById(employee.division).label}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Title</p>
                                <p className="text-gray-800 font-medium">{employee.role}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Company</p>
                                <p className="text-gray-800 font-medium">{employee.company || "Design Elements"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joining Date</p>
                                <p className="text-gray-800 font-medium">{dayjs(employee.joinedDate).format("MMMM DD, YYYY")}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Current Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                    <span className="text-gray-800 font-medium">{employee.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <MapPin size={20} className="text-brand-500" /> Professional Address
                        </h3>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Registered Address</p>
                            <p className="text-gray-600 leading-relaxed max-w-lg">{employee.address || "No address recorded in system."}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-brand-600 p-6 rounded-lg text-white shadow-lg shadow-brand-500/20 text-center">
                    <h3 className="font-bold text-lg mb-2">Notice Period</h3>
                    <p className="text-white/80 text-sm mb-6">Standard employment terms</p>
                    <div className="flex items-center justify-center gap-2 text-white font-black text-4xl">
                        <span>30</span>
                        <span className="text-xs font-normal opacity-60">DAYS</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(employee.documents || []).map((doc, idx: number) => {
              const status = getDocStatus(doc.expiryDate);
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                  <div className="p-6 flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                        <FileText size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">{doc.type === 'QID' ? 'Qatar ID' : doc.type}</h3>
                      <p className="text-xs font-bold text-gray-400 tracking-widest">{doc.number || "NUM-XXXXXXXX"}</p>
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-100 font-sans">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Expires On</p>
                        <p className="text-xs font-bold text-gray-700">{dayjs(doc.expiryDate).format("MMM DD, YYYY")}</p>
                      </div>
                      {doc.fileName && (
                        <div className="mt-3 flex items-center gap-2 text-brand-600 bg-brand-50/50 p-2 rounded-lg border border-brand-100">
                          <FileText size={14} className="shrink-0" />
                          <span className="text-[10px] font-bold truncate flex-1">{doc.fileName}</span>
                          <span className="text-[9px] opacity-60 font-medium">{doc.fileSize}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50/50 flex gap-2">
                       <a 
                         href={getUploadUrl(doc.fileUrl)} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex-1 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                       >
                           <ExternalLink size={14} /> View File
                       </a>
                       <button 
                         onClick={() => navigate(`/employees/edit/${employee.id}?step=2`)}
                         className="flex-1 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                       >
                           <Edit2 size={14} /> Edit
                       </button>
                   </div>
                </div>
              );
            })}

            <div className="bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500">Missing a document?</p>
                    <p className="text-xs text-gray-400 mt-1">Upload additional certifications or legal papers.</p>
                </div>
                <button 
                  onClick={() => navigate(`/employees/edit/${employee.id}?step=2`)}
                  className="mt-2 text-sm font-black text-brand-600 hover:underline"
                >
                  Add Custom Document
                </button>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <Clock size={40} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No recent activities</p>
            <p className="text-sm">Activity tracking for this employee will appear here.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-none">{previewDoc.type} Preview</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{previewDoc.fileName || 'Virtual Copy'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setPreviewDoc(null)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-gray-600"
                    >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div className="p-0 h-[500px] flex flex-col items-center justify-center bg-gray-50/30 overflow-hidden">
                    {previewDoc.fileUrl ? (
                        previewDoc.fileName?.toLowerCase().endsWith('.pdf') || previewDoc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe 
                                src={getUploadUrl(previewDoc.fileUrl)}
                                className="w-full h-full border-none"
                                title={previewDoc.fileName}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <img 
                                    src={getUploadUrl(previewDoc.fileUrl)}
                                    alt={previewDoc.fileName}
                                    className="max-w-full max-h-full object-contain shadow-lg rounded"
                                />
                            </div>
                        )
                    ) : (
                        <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-brand-50 text-brand-500 rounded-lg flex items-center justify-center mb-6 shadow-xl shadow-brand-500/10">
                                <FileText size={48} />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">No File Attached</h4>
                            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed text-sm">
                                This document record exists but no digital file was uploaded. 
                                Please edit the employee to attach a document.
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setPreviewDoc(null)}
                        className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Close Preview
                    </button>
                    {previewDoc.fileUrl && (
                        <a 
                            href={getUploadUrl(previewDoc.fileUrl)}
                            download={previewDoc.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 text-xs font-bold bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center gap-2"
                        >
                            <ExternalLink size={14} /> Full Resolution
                        </a>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
