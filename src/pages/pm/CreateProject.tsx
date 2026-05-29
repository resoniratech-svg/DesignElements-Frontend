import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { useActivity } from "../../context/ActivityContext";
import { useDivision } from "../../context/DivisionContext";
import { useAuth } from "../../context/AuthContext";
import DivisionTiles from "../../components/forms/DivisionTiles";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import ManagerAutocomplete from "../../components/forms/ManagerAutocomplete";
import { projectService } from "../../services/projectService";
// Removed unused userService import
import { Loader2, AlertCircle, CheckCircle, Upload, FileText, X, Paperclip } from "lucide-react";
import type { ProjectDocument } from "../../types/project";

// Removed unused FormState interface

function CreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logActivity } = useActivity();
  const { activeDivision } = useDivision();
  const { user } = useAuth();
  
  const isPM = user?.role === "PROJECT_MANAGER";
  const userDivision = (user?.division || "CONTRACTING").toUpperCase();

  const [form, setForm] = useState<any>({
    name: "",
    client: "",
    client_id: null,
    budget: "",
    manager: isPM ? user?.name : "",
    manager_id: isPM ? user?.id : null,
    startDate: "",
    endDate: "",
    description: "",
    status: "Active",
    division: isPM ? userDivision : (activeDivision === "all" ? "CONTRACTING" : activeDivision.toUpperCase())
  });

  const allowedSectors = useMemo(() => {
    return isPM && user?.division ? [user.division.toUpperCase()] : [];
  }, [isPM, user]);


  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (newProject) => {
      setErrorMsg(null);
      setSuccessMsg(`Project "${newProject.name || form.name}" created successfully! Redirecting...`);
      logActivity("Created New Project", "project", `/projects`, newProject.name, form.division);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setTimeout(() => navigate("/projects"), 1200);
    },
    onError: (error: any) => {
      setSuccessMsg(null);
      const msg = error?.response?.data?.message || error?.message || "Failed to create project. Please try again.";
      setErrorMsg(msg);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setForm((prev: any) => {
        const nextForm = { ...prev, [name]: value };
        if (prev.endDate && value > prev.endDate) {
          nextForm.endDate = value;
        }
        return nextForm;
      });
    } else if (name === "endDate") {
      setForm((prev: any) => {
        if (prev.startDate && value < prev.startDate) {
          return { ...prev, endDate: prev.startDate };
        }
        return { ...prev, [name]: value };
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc: ProjectDocument = {
          id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
          uploadedAt: new Date().toISOString()
        };
        setDocuments(prev => [...prev, doc]);
      };
      reader.readAsDataURL(file);
    });
    // Reset the input so the same file can be re-uploaded if removed
    e.target.value = "";
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!form.name?.trim() || !form.client?.trim()) {
      setErrorMsg("Project Name and Client are mandatory fields.");
      return;
    }

    // Map frontend form fields to PostgreSQL column names
    const payload: any = {
      project_name: form.name,
      client_name: form.client,
      client_id: form.client_id || null,
      contract_value: parseFloat(String(form.budget).replace(/[^0-9.]/g, "")) || 0,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      manager: form.manager || null,
      manager_id: form.manager_id || null,
      description: form.description || null,
      division: form.division || null,
      status: form.status || "Active",
    };

    if (documents.length > 0) {
      payload.uploaded_document = documents[0].data;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="p-6">
      <PageHeader showBack title="Create Project" subtitle="Start a new construction or renovation project" />

      <div className="bg-white p-6 rounded-xl border shadow-sm max-w-3xl mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Success Banner */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          <div className="col-span-2">
            <DivisionTiles
              selectedId={form.division}
              onChange={(id: any) => setForm({ 
                ...form, 
                division: id,
                client: "",
                client_id: null,
                manager: isPM ? user?.name : "",
                manager_id: isPM ? user?.id : null
              })}
              allowedIds={allowedSectors}
              showAll={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Project Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Client <span className="text-rose-500">*</span></label>
              <ClientAutocomplete
                value={form.client}
                onChange={(name, id) => setForm({ ...form, client: name, client_id: id })}
                division={form.division}
                placeholder="Select a client..."
              />
            </div>

            <FormInput
              label="Budget (QAR)"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. 500,000"
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 uppercase tracking-tighter text-[11px] font-black">Project Manager</label>
              {isPM ? (
                <div className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-slate-700 font-bold flex items-center justify-between shadow-inner h-[42px]">
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {user?.name}
                  </span>
                  <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    {user?.division} Sector
                  </span>
                </div>
              ) : (
                <ManagerAutocomplete
                  value={form.manager}
                  onChange={(name, id) => setForm({ ...form, manager: name, manager_id: id })}
                  division={form.division}
                  placeholder="Select a project manager..."
                />
              )}
            </div>

            <FormInput
              label="Start Date"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />

            <FormInput
              label="End Date"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate}
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 uppercase tracking-tighter text-[11px] font-black">Project Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow bg-white h-[42px] font-bold text-sm"
              >
                <option value="Active">Active Project</option>
                <option value="COMPLETED">Inactive Completed</option>
                <option value="Cancelled">Inactive Cancelled</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                rows={3}
                placeholder="Brief project overview..."
              />
            </div>

            {/* Document Upload Section */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-1.5">
                <Paperclip size={14} />
                Project Documents
              </label>

              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  <Upload size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                  <p className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Click to upload documents</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOC, XLS, Images (Max 5MB each)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Uploaded Files List */}
              {documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {documents.length} file{documents.length > 1 ? 's' : ''} attached
                  </p>
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-all group/doc">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-500 flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(doc.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/doc:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-brand-600 text-white px-8 py-2.5 rounded-lg hover:bg-brand-700 transition-all font-semibold shadow-sm flex items-center gap-2 disabled:opacity-70"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;