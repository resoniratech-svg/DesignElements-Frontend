import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import ApprovalBadge from "../../components/ApprovalBadge";
import { creditRequestService } from "../../services/creditRequestService";
import { Plus, Trash2, Eye, Edit, Landmark, Coins, Clock } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";

function CreditRequests() {
  const { activeDivision } = useDivision();
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingCR, setViewingCR] = useState<any | null>(null);

  // Filter credit requests based on active division
  const sectorFilteredRequests = useMemo(() => {
    return creditRequests.filter((cr) => {
      if (activeDivision === "all") return true;
      const division = String(cr.division || "").toLowerCase();
      return division === activeDivision.toLowerCase();
    });
  }, [creditRequests, activeDivision]);

  // Load credit requests from API
  const loadData = useCallback(async () => {
    try {
      const data = await creditRequestService.getAllRequests();
      setCreditRequests(data);
    } catch (err) {
      console.error("Failed to fetch credit requests:", err);
      setCreditRequests([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this credit request?")) return;
    try {
      await creditRequestService.deleteRequest(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete the request.");
    }
  }, [loadData]);

  // Apply filters and format for DataTable
  useEffect(() => {
    let filtered = [...sectorFilteredRequests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((cr) => (cr.approval_status || cr.approvalStatus) === statusFilter);
    }

    const formattedData = filtered.map((cr) => ({
      ...cr,
      "Request ID": cr.id,
      Client: cr.client_name || cr.clientName || "N/A",
      "Amount (QAR)": `QAR ${Number(cr.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      Reason: cr.reason || "N/A",
      Status: <ApprovalBadge status={cr.approval_status || cr.approvalStatus || "pending"} />,
      Date: cr.created_at || cr.createdAt ? new Date(cr.created_at || cr.createdAt).toLocaleDateString() : "N/A",
      Notes: cr.notes || "—",
      Actions: (
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingCR(cr);
            }}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <Link
            to={`/edit-credit-request/${cr.id}`}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
            title="Edit"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit size={16} />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(cr.id);
            }}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }));

    setFilteredData(formattedData);
  }, [sectorFilteredRequests, statusFilter, handleDelete]);

  // Stats
  const totalApproved = sectorFilteredRequests
    .filter((cr) => (cr.approval_status || cr.approvalStatus) === "approved")
    .reduce((sum, cr) => sum + Number(cr.amount || 0), 0);

  const pendingAmount = sectorFilteredRequests
    .filter((cr) => (cr.approval_status || cr.approvalStatus) === "pending")
    .reduce((sum, cr) => sum + Number(cr.amount || 0), 0);

  const pendingCount = sectorFilteredRequests.filter((cr) => (cr.approval_status || cr.approvalStatus) === "pending").length;

  const columns = [
    "Request ID",
    "Client",
    "Amount (QAR)",
    "Reason",
    "Status",
    "Date",
    "Notes",
    "Actions",
  ];

  return (
    <div className="p-6">
      <PageHeader
        showBack
        title="Credit Request Management"
        subtitle="Track and manage all client credit limit requests"
        action={
          <Link to="/credit-request">
            <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
              <Plus size={16} />
              New Credit Request
            </button>
          </Link>
        }
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Approved Credit"
          value={`QAR ${totalApproved.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={<Coins size={20} className="text-emerald-500" />}
          onClick={() => setStatusFilter("approved")}
        />
        <StatCard
          title="Pending Approval"
          value={`QAR ${pendingAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={
            <div className="relative">
              <Clock size={20} className="text-amber-500" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                {pendingCount}
              </span>
            </div>
          }
          onClick={() => setStatusFilter("pending")}
        />
        <StatCard
          title="Total Requests"
          value={sectorFilteredRequests.length.toString()}
          icon={<Landmark size={20} className="text-indigo-500" />}
          onClick={() => setStatusFilter("all")}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[240px]"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setStatusFilter("all")}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium px-3 py-2 rounded-lg hover:bg-brand-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {filteredData.length > 0 ? (
          <DataTable columns={columns} data={filteredData} hideSearch={true} />
        ) : (
          <div className="p-12 text-center">
            <Landmark size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              No credit requests found
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {statusFilter !== "all"
                ? "Try adjusting your filters or create a new credit request."
                : "Start by submitting the first credit request."}
            </p>
            <Link to="/credit-request">
              <button className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition">
                <Plus size={14} className="inline mr-1" /> New Credit Request
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* View Credit Request Modal */}
      {viewingCR && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setViewingCR(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Landmark size={20} className="text-indigo-500" />
                Credit Request Details
              </h2>
              <button
                onClick={() => setViewingCR(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Request ID
                  </p>
                  <p className="text-sm font-semibold text-brand-600 mt-1">
                    {viewingCR.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {viewingCR.client_name || viewingCR.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Amount
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    QAR{" "}
                    {Number(viewingCR.amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      (viewingCR.approval_status || viewingCR.approvalStatus) === "approved"
                        ? "bg-emerald-100 text-emerald-600"
                        : (viewingCR.approval_status || viewingCR.approvalStatus) === "rejected"
                        ? "bg-rose-100 text-rose-600"
                        : (viewingCR.approval_status || viewingCR.approvalStatus) === "due"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {viewingCR.approval_status || viewingCR.approvalStatus || "pending"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Reason
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {viewingCR.reason || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {viewingCR.notes || "No notes"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Date
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {viewingCR.created_at || viewingCR.createdAt
                      ? new Date(viewingCR.created_at || viewingCR.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                to={`/edit-credit-request/${viewingCR.id}`}
                className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Edit Request
              </Link>
              <button
                onClick={() => setViewingCR(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditRequests;
