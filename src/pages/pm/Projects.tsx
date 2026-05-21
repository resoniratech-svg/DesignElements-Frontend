import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Plus, Edit, Trash2, Download, Loader2, Paperclip, FileText } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportToCSV } from "../../utils/exportUtils";
import { useActivity } from "../../context/ActivityContext";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { projectService } from "../../services/projectService";
import { downloadBase64File } from "../../utils/fileUtils";

function Projects() {
  const queryClient = useQueryClient();
  const { logActivity } = useActivity();
  const { activeDivision } = useDivision();
  const [displayLimit] = useState(1000);

  // 1. Fetch data using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["projects", activeDivision, displayLimit],
    queryFn: () => projectService.getProjects(activeDivision, 1, displayLimit),
    placeholderData: (previousData) => previousData,
  });

  const projects = data?.data || [];

  // 2. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      const project = projects.find((p) => p.id === id);
      logActivity("Deleted Project", "project", "/projects", project?.name || project?.projectName || id);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const handleExport = () => {
    const dataForExport = projects.map((p) => ({
      "Project Name": p.name || p.projectName,
      "Client": p.client,
      "Budget": p.budget,
      "Manager": p.manager,
      "Start Date": p.startDate || "-",
      "End Date": p.endDate || "-",
      "Status": p.status,
      "Deadline": p.deadline
    }));
    exportToCSV(dataForExport, "projects_export.csv");
  };

  const handleDelete = (id: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete project: ${projectName}?`)) {
      deleteMutation.mutate(id);
    }
  };


  const downloadFile = (doc: any) => {
    if (doc.data && doc.data.startsWith('data:')) {
      downloadBase64File(doc.data, doc.name);
    } else {
      const link = document.createElement("a");
      link.href = doc.data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const tableData = projects.map((item) => ({
    ...item,
    "Project": item.name || item.projectName,
    "Client": item.client_name || item.client,
    "Sector": item.division ? item.division.toUpperCase() : "N/A",
    "Budget": item.budget || item.contract_value,
    "Manager": item.manager,
    "Start Date": item.startDate || "-",
    "End Date": item.endDate || "-",
    "Status": <StatusBadge status={item.status || "Pending"} />,
    "Docs": (
      <div className="flex flex-wrap gap-1">
        {item.uploadedDocument && (
          <button
            onClick={() => downloadFile({ 
              name: `${item.name || item.projectName || 'project'}_document`, 
              data: item.uploadedDocument 
            })}
            className="p-1.5 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded border border-blue-100 transition-all flex items-center justify-center"
            title="Download Project Document"
          >
            <FileText size={12} />
          </button>
        )}
        {item.documents && item.documents.length > 0 ? (
          item.documents.map((doc: any, idx: number) => (
            <button
              key={doc.id || idx}
              onClick={() => downloadFile(doc)}
              className="p-1.5 bg-slate-50 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded border border-slate-100 transition-all flex items-center justify-center"
              title={`Download ${doc.name}`}
            >
              <Paperclip size={12} />
            </button>
          ))
        ) : !item.uploadedDocument && (
          <span className="text-[10px] text-slate-300 italic">None</span>
        )}
      </div>
    ),
    "Actions": (
      <div className="flex gap-2">
        <Link to={`/edit-project/${item.id}`} className="p-1 text-slate-400 hover:text-amber-600 transition-colors">
          <Edit size={16} />
        </Link>
        <button
          onClick={() => handleDelete(item.id, item.name || item.projectName)}
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

  const columns = ["Project", "Client", "Sector", "Budget", "Manager", "Start Date", "End Date", "Status", "Docs", "Actions"];

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  return (
    <>
      <PageHeader showBack
        title={activeDivision === "all" ? "Projects" : `${currentDivision?.label} Projects`}
        subtitle={activeDivision === "all" ? "Manage your current and upcoming projects" : `Viewing projects for ${currentDivision?.label}`}
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase"
            >
              <Download size={16} />
              Export
            </button>
            <Link to="/create-project">
              <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-bold text-xs uppercase">
                <Plus size={16} />
                Create Project
              </button>
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
        {isLoading ? (
          <PageLoader message="Organizing Project Portfolios..." />
        ) : (
          <DataTable 
            columns={columns} 
            data={tableData} 
          />
        )}
      </div>
    </>
  );
}

export default Projects;