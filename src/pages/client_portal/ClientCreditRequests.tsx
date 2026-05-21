import { useState, useEffect, useCallback } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import ApprovalBadge from "../../components/ApprovalBadge";
import { creditRequestService } from "../../services/creditRequestService";
import { Landmark } from "lucide-react";
import PageLoader from "../../components/PageLoader";

function ClientCreditRequests() {
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load credit requests from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await creditRequestService.getAllRequests();
      setCreditRequests(data);
    } catch (err) {
      console.error("Failed to fetch credit requests:", err);
      setCreditRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format for DataTable
  useEffect(() => {
    const formattedData = creditRequests.map((cr) => ({
      ...cr,
      "Request ID": cr.id,
      "Amount (QAR)": `QAR ${Number(cr.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      Reason: cr.reason || "N/A",
      Status: <ApprovalBadge status={cr.approval_status || cr.approvalStatus || "pending"} />,
      Date: cr.created_at || cr.createdAt ? new Date(cr.created_at || cr.createdAt).toLocaleDateString() : "N/A",
      Notes: cr.notes || "—",
    }));

    setFilteredData(formattedData);
  }, [creditRequests]);

  const columns = [
    "Request ID",
    "Amount (QAR)",
    "Reason",
    "Status",
    "Date",
    "Notes",
  ];

  if (loading) {
    return <PageLoader message="Loading Credit Requests..." />;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="My Credit Requests"
        subtitle="Track your submitted credit limit requests and their approval status"
      />

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mt-6">
        {filteredData.length > 0 ? (
          <DataTable columns={columns} data={filteredData} hideSearch={false} />
        ) : (
          <div className="p-12 text-center">
            <Landmark size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              No credit requests found
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              You do not have any credit requests at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientCreditRequests;
