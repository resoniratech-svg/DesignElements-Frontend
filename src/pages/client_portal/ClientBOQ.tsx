import { useMemo } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { boqService } from "../../services/boqService";

const columns = ["ID", "Project", "Total Amount", "Status", "Date", "Actions"];

interface BOQTableData {
  ID: string;
  Project: string;
  "Total Amount": string | number;
  Status: React.ReactNode;
  Date: string;
  Actions: React.ReactNode;
}

export default function ClientBOQ() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["boqs", "client"],
    queryFn: () => boqService.getAllBOQs(1, 100), // Fetch all for portal
    select: (res) => res.data?.data || res.data || []
  });

  const tableData = useMemo<BOQTableData[]>(() => {
    const boqs = response || [];
    return boqs.map((item: any) => ({
      "ID": item.boq_number || item.id,
      "Project": item.project_name,
      "Total Amount": `QAR ${Number(item.total_amount).toLocaleString()}`,
      "Date": new Date(item.date).toLocaleDateString(),
      "Status": <StatusBadge status={item.status} />,
      "Actions": (
        <div className="flex gap-2">
          <Link 
            to={`/boq-details/${item.id}`} 
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <Eye size={14} />
            <span>View Details</span>
          </Link>
        </div>
      )
    }));
  }, [response]);

  if (isLoading) return <div className="p-6">Loading your BOQs...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bill of Quantities (BOQ)"
        subtitle="Review material estimations and project quantities for your projects"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {tableData.length > 0 ? (
          <DataTable columns={columns} data={tableData} />
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No BOQs Found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
              We couldn't find any Bill of Quantities assigned to your account yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
