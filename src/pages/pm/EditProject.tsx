import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useActivity } from "../../context/ActivityContext";
import { projectService } from "../../services/projectService";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import ManagerAutocomplete from "../../components/forms/ManagerAutocomplete";
import { Loader2, AlertCircle, CheckCircle, Upload, FileText, X } from "lucide-react";
import type { Project } from "../../types/project";

interface FormState {
    name: string;
    client: string;
    client_id: string | number | null;
    budget: string;
    manager: string;
    manager_id: string | number | null;
    status: string;
    description: string;
    startDate: string;
    endDate: string;
    division: string;
}

function ProjectEditForm({ project, id }: { project: Project, id: string }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logActivity } = useActivity();

    const [form, setForm] = useState<FormState>({
        name: project.name || project.projectName || "",
        client: project.client || project.clientName || "",
        client_id: project.client_id || null,
        budget: String(project.budget || project.value || ""),
        manager: project.manager || "",
        manager_id: project.manager_id || null,
        status: project.status || "CREATED",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || project.deadline || "",
        division: project.division || project.branch || "CONTRACTING",
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [uploadedDoc, setUploadedDoc] = useState<string | null>(
        typeof project.uploadedDocument === "string"
            ? project.uploadedDocument
            : null
    );

    const [docFileName, setDocFileName] = useState<string | null>(
        project.uploadedDocument ? "Uploaded document" : null
    );

    const updateMutation = useMutation({
        mutationFn: (data: any) => projectService.updateProject(id, data),
        onSuccess: () => {
            setErrorMsg(null);
            setSuccessMsg("Project updated successfully! Redirecting...");
            logActivity(`Updated Project`, "project", `/projects`, form.name);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["pm-stats"] });
            setTimeout(() => navigate("/projects"), 1200);
        },
        onError: (error: any) => {
            setSuccessMsg(null);
            const msg = error?.response?.data?.message || error?.message || "Failed to update project.";
            setErrorMsg(msg);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "startDate") {
            setForm(prev => {
                const nextForm = { ...prev, [name]: value };
                if (prev.endDate && value > prev.endDate) {
                    nextForm.endDate = value;
                }
                return nextForm;
            });
        } else if (name === "endDate") {
            setForm(prev => {
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
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setUploadedDoc(reader.result as string);
            setDocFileName(file.name);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
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
            manager: form.manager || null,
            manager_id: form.manager_id || null,
            status: form.status || null,
            description: form.description || null,
            start_date: form.startDate || null,
            end_date: form.endDate || null,
            division: form.division || null,
        };

        if (uploadedDoc) {
            payload.uploaded_document = uploadedDoc;
        }

        updateMutation.mutate(payload);
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm max-w-3xl mt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                        <CheckCircle size={18} className="flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Project Name <span className="text-rose-500">*</span></label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Client <span className="text-rose-500">*</span></label>
                        <ClientAutocomplete
                            value={form.client}
                            onChange={(name, id) => setForm({ ...form, client: name, client_id: id || null })}
                            division={form.division}
                            placeholder="Search client..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Budget</label>
                        <input
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Project Manager</label>
                        <ManagerAutocomplete
                            value={form.manager}
                            onChange={(name, id) => setForm({ ...form, manager: name, manager_id: id || null })}
                            division={form.division}
                            placeholder="Search manager..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                        >
                            <option value="Active">Active Project</option>
                            <option value="COMPLETED">Inactive Completed</option>
                            <option value="Cancelled">Inactive Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            min={form.startDate}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>

                {/* Document Upload */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Upload Document</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        {docFileName ? (
                            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-brand-600" />
                                    <span className="text-sm font-medium text-slate-700">{docFileName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setUploadedDoc(null); setDocFileName(null); }}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center gap-2 cursor-pointer py-2">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-sm text-gray-500">Click to upload a document</span>
                                <span className="text-xs text-gray-400">PDF, DOC, XLS, Images (Max 5MB)</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex-1 bg-brand-600 text-white px-4 py-2.5 rounded-lg hover:bg-brand-700 transition-all font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Project"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="flex-1 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold shadow-sm"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: project, isLoading, error: fetchError } = useQuery<Project>({
        queryKey: ["project", id],
        queryFn: () => projectService.getProject(id!),
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-[400px]">
                <Loader2 size={48} className="animate-spin text-brand-600" />
                <p className="text-lg font-medium">Loading project details...</p>
            </div>
        );
    }

    if (fetchError || !project) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-red-400 min-h-[400px]">
                <AlertCircle size={48} />
                <p className="text-lg font-medium">Project not found or fetch failed.</p>
                <button onClick={() => navigate("/projects")} className="btn-secondary">Back to Projects</button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <PageHeader showBack
                title="Edit Project"
                subtitle={`Updating: ${project.name || project.projectName}`}
            />
            <ProjectEditForm project={project} id={id!} key={project.id} />
        </div>
    );
}

export default EditProject;
