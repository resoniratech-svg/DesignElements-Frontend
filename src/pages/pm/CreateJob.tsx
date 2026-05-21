import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import DocumentUpload from "../../components/DocumentUpload";
import { useDivision } from "../../context/DivisionContext";
import DivisionTiles from "../../components/forms/DivisionTiles";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "../../services/jobService";
import { Loader2 } from "lucide-react";
import type { DivisionId } from "../../constants/divisions";
import type { Job } from "../../types/project";

interface FormState {
  clientName: string;
  serviceType: string;
  status: string;
  dueDate: string;
  description: string;
  division: DivisionId;
}

function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();

  const [form, setForm] = useState<FormState>({
    clientName: "",
    serviceType: "",
    status: "New",
    dueDate: "",
    description: "",
    division: (activeDivision === "all" ? "CONTRACTING" : activeDivision) as DivisionId
  });

  const createMutation = useMutation({
    mutationFn: jobService.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/jobs");
    },
    onError: (error: Error) => {
      alert(`Failed to create job: ${error.message || 'Unknown error'}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobPayload: Partial<Job> = {
      ...form,
      branch: form.division
    };
    createMutation.mutate(jobPayload);
  };

  return (
    <div className="p-6">
      <PageHeader showBack title="Create Job" subtitle="Define a new service request or deliverable" />

      <div className="bg-white p-6 rounded-xl border shadow-sm mt-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="col-span-2">
            <DivisionTiles
              selectedId={form.division}
              onChange={(id: any) => setForm({ ...form, division: id, clientName: "" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Client Name"
              name="clientName"
              value={form.clientName}
              placeholder="ABC Company"
              onChange={handleChange}
              required
            />

            <FormInput
              label="Service Type"
              name="serviceType"
              value={form.serviceType}
              placeholder="Visa Renewal"
              onChange={handleChange}
              required
            />

            <FormSelect
              label="Job Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                "New",
                "Submitted",
                "Under Process",
                "Approved",
                "Completed",
                "Delivered"
              ]}
            />

            <FormInput
              label="Due Date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />

            <div className="col-span-2">
              <FormTextarea
                label="Job Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Details of the service request..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attachments</label>
              <DocumentUpload />
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
                "Save Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;