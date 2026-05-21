import { useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boqService } from "../../services/boqService";
import { getDivisionById } from "../../constants/divisions";
import { useDivision } from "../../context/DivisionContext";

const columns = ["ID", "Project", "Sector", "Client", "Total Amount", "Status", "Date", "Actions"];

interface BOQTableData {
  ID: string;
  Project: string;
  Sector: React.ReactNode;
  Client: string;
  "Total Amount": string | number;
  Status: React.ReactNode;
  Date: string;
  Actions: React.ReactNode;
}

function BOQ() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  
  // Keep local state for display limit only


  const [displayLimit] = useState(1000);

  const { data: boqResponse, isLoading } = useQuery({
    queryKey: ["boqs", activeDivision, displayLimit],
    queryFn: () => boqService.getAllBOQs(1, displayLimit, activeDivision),
    placeholderData: (previousData) => previousData
  });

  const boqs = boqResponse?.data?.data || boqResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: boqService.deleteBOQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boqs"] });
    }
  });

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this BOQ?")) {
      deleteMutation.mutate(id);
    }
  };

  const tableData = useMemo<BOQTableData[]>(() => {
    return boqs.map((item: any) => {
      const division = getDivisionById(item.sector || item.division);
      return {
        "ID": item.boq_number || item.id,
        "Project": item.project_name,
        "Sector": (
          <span className={`px-2 py-1 rounded text-[10px] font-bold ${division.bg} ${division.text} border ${division.border}`}>
            {division.label.replace(" Sector", "")}
          </span>
        ),
        "Client": item.client_name,
        "Total Amount": `QAR ${Number(item.total_amount).toLocaleString()}`,
        "Date": new Date(item.date).toLocaleDateString(),
        "Status": <StatusBadge status={item.status} />,
        "Actions": (
          <div className="flex gap-2">
            <Link to={`/boq-details/${item.id}`} className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
              <Eye size={16} />
            </Link>
            <Link to={`/edit-boq/${item.id}`} className="p-1 text-slate-400 hover:text-amber-600 transition-colors">
              <Edit size={16} />
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      };
    });
  }, [boqs, activeDivision]);

  if (isLoading) return <div className="p-6">Loading BOQs...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Quantities (BOQ)"
        subtitle="Manage material estimations and project quantities"
        action={
          <button
            onClick={() => navigate("/create-boq")}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create BOQ
          </button>
        }
      />


      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable 
          columns={columns} 
          data={tableData} 
        />
      </div>
    </div>
  );
}

export default BOQ;
