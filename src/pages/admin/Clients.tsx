import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "../../components/DataTable";
import { Link, useNavigate } from "react-router-dom";
import { Download, Trash2, Eye, Plus, Edit2, Loader2, AlertTriangle, X } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportToCSV } from "../../utils/exportUtils";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";

import { clientService } from "../../services/clientService";

function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  const [displayLimit] = useState(1000);
  const [warningModal, setWarningModal] = useState<{ open: boolean; message: string } | null>(null);

  // 1. Fetch data using React Query (Aligned with Client Service)
  const { data, isLoading } = useQuery({
    queryKey: ["clients", activeDivision, displayLimit],
    queryFn: () => clientService.getClients({ 
      division: activeDivision === "all" ? undefined : activeDivision,
      limit: displayLimit,
      page: 1
    }),
    placeholderData: (previousData) => previousData,
  });

  const rawClients = data?.data || [];

  const clients = rawClients;


  // 2. Delete mutation (Aligned with Client Service)
  const deleteMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Force immediate refetch of the list
      queryClient.refetchQueries({ queryKey: ["clients", activeDivision] });
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete client. Please ensure all linked connections are cleared first.";
      setWarningModal({ open: true, message: errorMsg });
    }
  });

  const handleExport = () => {
    const dataForExport = clients.map((c: any) => ({
      "ID": c.id,
      "Name": c.name,
      "Email": c.email,
      "Phone": c.phone,
      "Address": c.address,
      "Contact Person": c.contactPerson,
      "Division": c.division,
      "Sector": c.sector
    }));
    exportToCSV(dataForExport, "clients_export.csv");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client entity?")) {
      deleteMutation.mutate(id);
    }
  };

  const tableData = clients.map((item: any) => ({
    ...item,
    "Name": item.contactPerson || "N/A",
    "Email": item.email || "N/A",
    "Phone": item.phone || "N/A",
    "Company": item.name || "N/A",
    "Sector": item.division || item.sector || "N/A",
    Actions: (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/client-details/${item.id}`)}
          className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
          title="View Details"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/edit-client/${item.id}`)}
          className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
          title="Edit Profile"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleDelete(item.id)}
          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          disabled={deleteMutation.isPending}
          title="Delete Client"
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
  const pageTitle = activeDivision === "all" ? "All Clients" : `${currentDivision?.label} Clients`;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium italic">Manage and track client relationships for {currentDivision?.label || "all sectors"}</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm font-semibold text-sm"
          >
            <Download size={16} />
            Export
          </button>
          <Link to="/create-client" className="flex-1 sm:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg hover:bg-brand-700 transition shadow-sm font-semibold text-sm">
              <Plus size={16} />
              Create Client
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
        {isLoading && rawClients.length === 0 ? (
          <PageLoader message="Synchronizing CRM Database..." />
        ) : (
          <DataTable 
            columns={["Name", "Email", "Phone", "Company", "Sector", "Actions"]} 
            data={tableData} 
          />
        )}
      </div>

      {/* Linked Connections Warning Modal */}
      {warningModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Cannot Delete Client</h3>
                  <p className="text-xs text-amber-700 font-semibold">Active Linked Connections Detected</p>
                </div>
              </div>
              <button
                onClick={() => setWarningModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-amber-100/50 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {warningModal.message}
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">💡 What you can do:</p>
                <p>1. Open the linked module (Projects, Invoices, BOQ, or Quotations).</p>
                <p>2. Reassign those records to another client or delete them.</p>
                <p>3. Return here to delete this client entity cleanly.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setWarningModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition shadow-md shadow-slate-900/10 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;