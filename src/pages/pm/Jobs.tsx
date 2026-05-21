import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import { Link } from "react-router-dom";
import { Plus, Trash2, Eye, Download, Loader2 } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import PageLoader from "../../components/PageLoader";
import { exportToCSV } from "../../utils/exportUtils";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { jobService } from "../../services/jobService";
import type { Job } from "../../types/project";

function Jobs() {
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();

  // 1. Fetch data using React Query
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs", activeDivision],
    queryFn: jobService.getJobs,
    select: (data: Job[]) => {
      return activeDivision === "all" 
        ? data 
        : data.filter((j: Job) => {
            const jDiv = (j.division || j.branch || "").toLowerCase();
            return jDiv === activeDivision;
          });
    }
  });

  // 2. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: jobService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });

  const handleExport = () => {
    const dataForExport = jobs.map((j: Job) => ({
      "Job ID": j.jobId || j.id,
      "Client": j.clientName || j.client || "N/A",
      "Job Type": j.serviceType || j.JobType || j.title || "General",
      "Status": j.status,
      "Due Date": j.dueDate
    }));
    exportToCSV(dataForExport, "jobs_export.csv");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(id);
    }
  };

  const tableData = jobs.map((item: Job) => ({
    ...item,
    "Job ID": item.jobId || item.id,
    Client: item.clientName || item.client || "N/A",
    "Job Type": item.serviceType || item.JobType || item.title || "General",
    Status: <StatusBadge status={item.status || "New"} />,
    "Due Date": item.dueDate,
    Actions: (
      <div className="flex gap-2">
        <Link to={`/job-details/${item.id}`} className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
          <Eye size={16} />
        </Link>
        <button
          onClick={() => handleDelete(item.id)}
          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending && deleteMutation.variables === item.id ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    )
  }));

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  const columns = ["Job ID", "Client", "Job Type", "Status", "Due Date", "Actions"];

  return (
    <>
      <PageHeader
        title={activeDivision === "all" ? "Jobs" : `${currentDivision?.label} Jobs`}
        subtitle={activeDivision === "all" ? "Track ongoing jobs and deliverables" : `Viewing jobs for ${currentDivision?.label}`}
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase"
            >
              <Download size={16} />
              Export
            </button>
            <Link to="/create-job">
              <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-bold text-xs uppercase">
                <Plus size={16} />
                Create Job
              </button>
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
        {isLoading ? (
          <PageLoader message="Tracking Operational Jobs..." />
        ) : (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>
    </>
  );
}

export default Jobs;
