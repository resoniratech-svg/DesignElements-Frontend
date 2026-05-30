import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, FileText, Check, AlertCircle, ChevronRight, Eye } from "lucide-react";
import { DIVISIONS } from "../../constants/divisions";
import type { DivisionId } from "../../constants/divisions";
import FileUploader from "../../components/FileUploader";
import { getUploadUrl } from "../../services/api";
import { employeeService } from "../../services/employeeService";
import type { Employee, EmployeeDocument } from "../../types/employee";
import { useAuth } from "../../context/AuthContext";

export default function AddEditEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    division: "CONTRACTING" as DivisionId,
    role: "",
    status: "Active",
    company: isClient ? (user?.company_name || user?.name || "") : "Design Elements",
    joinedDate: new Date().toISOString().split("T")[0],
    documents: [
      { type: "QID", number: "", issueDate: "", expiryDate: "" },
      { type: "Passport", number: "", issueDate: "", expiryDate: "" },
      { type: "Contract", number: "", issueDate: "", expiryDate: "" },
    ]
  });

  // 1. Fetch Employee if editing
  const { data: employee } = useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: isEdit && !!id
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else if (!isEdit) {
        // Generate a temporary ID for new employees
        const newId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Read pre-fill values from URL
        const preFillCompany = searchParams.get("company");
        const preFillDivision = searchParams.get("division");
        
        setFormData((prev) => ({ 
          ...prev, 
          id: newId,
          company: preFillCompany || "Design Elements",
          division: (preFillDivision as DivisionId) || prev.division
        }));
    }

    // Check for deep-link step
    const s = searchParams.get("step");
    if (s) setStep(parseInt(s));
  }, [employee, isEdit, searchParams]);

  const handleBasicChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (e.target.name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (e.target.name === "phone") {
      value = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleDocChange = <K extends keyof EmployeeDocument>(index: number, field: K, value: EmployeeDocument[K]) => {
    setFormData((prev) => {
        const newDocs = [...(prev.documents || [])];
        if (newDocs[index]) {
            newDocs[index] = { ...newDocs[index], [field]: value };
            
            // Chronological auto-adjuster logic
            if (field === "issueDate") {
                const issueVal = String(value);
                const expiryVal = String(newDocs[index].expiryDate || "");
                if (expiryVal && issueVal > expiryVal) {
                    newDocs[index].expiryDate = issueVal;
                }
            } else if (field === "expiryDate") {
                const expiryVal = String(value);
                const issueVal = String(newDocs[index].issueDate || "");
                if (expiryVal && issueVal && expiryVal < issueVal) {
                    newDocs[index].issueDate = expiryVal;
                }
            }
        }
        return { ...prev, documents: newDocs };
    });
  };

  const addDocumentRow = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        { type: "Other", number: "", issueDate: "", expiryDate: "" }
      ]
    }));
  };

  const removeDocumentRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
      return formData.name && formData.id && formData.phone && formData.role;
  };

  // 2. Mutation for create/update
  const mutation = useMutation({
    mutationFn: (data: Partial<Employee>) => isEdit ? employeeService.updateEmployee(id!, data) : employeeService.createEmployee(data),
    onSuccess: async (data) => {
        console.log("Employee created/updated successfully:", data);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["employees"] }),
            queryClient.invalidateQueries({ queryKey: ["pro-contracts"] }),
            queryClient.invalidateQueries({ queryKey: ["pro-all-documents"] }),
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] })
        ]);
        if (isEdit) await queryClient.invalidateQueries({ queryKey: ["employee", id] });
        
        alert(`Employee ${isEdit ? 'updated' : 'registered'} successfully!`);
        navigate("/employees/list");
    },
    onError: (error: Error) => {
        alert(`Failed to ${isEdit ? 'update' : 'create'} employee: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 bg-white rounded-full transition-colors shadow-sm shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{isEdit ? "Edit Employee" : "Add New Employee"}</h1>
          <p className="text-xs sm:text-sm text-gray-500">{isEdit ? `Modifying details for ${formData.name}` : "Enter staff details to register in EMS"}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-brand-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>1</div>
                  <span className="text-sm font-bold hidden sm:inline">Basic Info</span>
              </div>
              <div className="w-12 h-px bg-gray-200"></div>
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-brand-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>2</div>
                  <span className="text-sm font-bold hidden sm:inline">Documents</span>
              </div>
          </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {step === 1 ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-brand-600 mb-2">
                <User size={18} />
                <h2 className="font-bold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
                <input 
                  name="name"
                  value={formData.name || ""}
                  onChange={handleBasicChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Employee ID *</label>
                <input 
                  name="id"
                  value={formData.id || ""}
                  onChange={handleBasicChange}
                  readOnly={isEdit}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-75"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</label>
                <input 
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleBasicChange}
                  placeholder="+974 XXXX XXXX"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input 
                  name="email"
                  value={formData.email || ""}
                  onChange={handleBasicChange}
                  placeholder="name@trekgroup.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Division</label>
                {searchParams.get("division") ? (
                  <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 min-h-[42px] flex items-center">
                    {DIVISIONS.find(d => d.id === formData.division)?.label || formData.division}
                  </div>
                ) : (
                  <select 
                    name="division"
                    value={formData.division}
                    onChange={handleBasicChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                  >
                    {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Role / Designation *</label>
                <input 
                  name="role"
                  value={formData.role || ""}
                  onChange={handleBasicChange}
                  placeholder="e.g. Site Engineer"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {!isClient && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Company</label>
                  {searchParams.get("company") ? (
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 min-h-[42px] flex items-center">
                      {formData.company}
                    </div>
                  ) : (
                    <input 
                      name="company"
                      value={formData.company || ""}
                      onChange={handleBasicChange}
                      placeholder="e.g. Design Elements"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                  )}
                </div>
              )}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                <textarea 
                  name="address"
                  value={formData.address || ""}
                  onChange={handleBasicChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
                className="btn-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in font-sans">
            <div className="flex items-center gap-2 text-brand-600">
                <FileText size={18} />
                <h2 className="font-bold">Mandatory Documents</h2>
            </div>

            <div className="space-y-10">
              {formData.documents?.map((doc, idx) => (
                <div key={idx} className="p-4 sm:p-6 rounded-xl border border-gray-100 bg-gray-50/30 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {doc.type === "QID" ? "Qatar ID" : doc.type}
                    </h3>
                    {idx > 2 && (
                      <button 
                        onClick={() => removeDocumentRow(idx)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{doc.type} Number</label>
                        <input 
                            value={doc.number}
                            onChange={(e) => handleDocChange(idx, 'number', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/10"
                            placeholder="Enter number"
                        />
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issue Date</label>
                        <input 
                            type="date"
                            value={doc.issueDate ? doc.issueDate.split(/[T ]/)[0] : ""}
                            onChange={(e) => handleDocChange(idx, 'issueDate', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                        <input 
                            type="date"
                            value={doc.expiryDate ? doc.expiryDate.split(/[T ]/)[0] : ""}
                            min={doc.issueDate ? doc.issueDate.split(/[T ]/)[0] : undefined}
                            onChange={(e) => handleDocChange(idx, 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/10"
                        />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Upload Copy (Drag & Drop or Click)</label>
                    <FileUploader 
                        multiple={false}
                        module="ems"
                        onUpload={(files, urls) => {
                            if (files.length > 0 && urls.length > 0) {
                                const file = files[0];
                                const url = urls[0];
                                handleDocChange(idx, 'fileUrl', url);
                                handleDocChange(idx, 'fileName', file.name);
                                handleDocChange(idx, 'fileSize', (file.size / (1024 * 1024)).toFixed(2) + " MB");
                            }
                        }}
                    />
                    {doc.fileName && (
                        <div className="mt-2 flex items-center justify-between p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100 animate-fade-in">
                            <div className="flex items-center gap-2 truncate mr-2">
                                <FileText size={14} className="shrink-0" /> 
                                <span className="truncate">{doc.fileName} ({doc.fileSize})</span>
                            </div>
                            <a 
                                href={getUploadUrl(doc.fileUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                            >
                                <Eye size={12} /> View
                            </a>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              <button 
                onClick={addDocumentRow}
                className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/30 transition-all font-bold flex items-center justify-center gap-2 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Add Another Document
              </button>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Back to Info
              </button>
              <button 
                onClick={handleSubmit}
                className="btn-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30"
              >
                <Check size={18} /> {isEdit ? "Update Employee" : "Complete Registration"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helper Info */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
        <AlertCircle className="text-amber-500 shrink-0" size={18} />
        <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Please ensure all document details match the original physical copies for compliance. 
            Automated alerts will be sent out {step === 2 ? 'based on these expiry dates' : 'to the registered phone/email'}.
        </p>
      </div>
    </div>
  );
}

