import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import { ArrowLeft, Landmark } from "lucide-react";
import { useApprovals } from "../../context/ApprovalContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "../../services/clientService";
import api from "../../services/api";
import { creditRequestService } from "../../services/creditRequestService";
import { useDivision } from "../../context/DivisionContext";
import ApprovalBadge from "../../components/ApprovalBadge";


function CreditRequest() {
  const navigate = useNavigate();
  const { activeDivision } = useDivision();
  const { id } = useParams();
  const isEditing = !!id;
  const { requestApproval } = useApprovals();
  const { user } = useAuth();
  const { logActivity } = useActivity();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  // Fetch all clients from backend directly
  const { data, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getClients({ limit: 1000 })
  });

  const clients = data?.data || [];

  const filteredClients = clients.filter((c: any) => {
    if (activeDivision === "all") return true;
    const division = String(c.sector || c.division || "").toLowerCase();
    return division === activeDivision.toLowerCase();
  });

  const [form, setForm] = useState({
    clientId: "",
    clientName: "",
    requestedLimit: "",
    reason: "",
    notes: "",
    approvalStatus: "pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing credit request when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchRequest = async () => {
        try {
          const existing = await creditRequestService.getRequestById(id);
          if (existing) {
            setForm({
              clientId: String(existing.client_id),
              clientName: existing.client_name || "",
              requestedLimit: String(existing.amount),
              reason: existing.reason || "",
              notes: existing.notes || "",
              approvalStatus: existing.approval_status || "pending",
            });
          }
        } catch (err) {
          console.error("Failed to fetch credit request:", err);
        }
      };
      fetchRequest();
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Load history from API instead of local history
    const fetchHistory = async () => {
      try {
        const history = await creditRequestService.getAllRequests();
        setRecentRequests(history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
        ...form,
        [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isApproved = user?.role === "SUPER_ADMIN";

      const payload = {
        clientId: parseInt(form.clientId),
        amount: parseFloat(form.requestedLimit) || 0,
        reason: form.reason,
        notes: form.notes,
        approvalStatus: form.approvalStatus
      };

      let savedRequest;
      if (isEditing && id) {
        savedRequest = await creditRequestService.updateRequest(id, payload);
      } else {
        savedRequest = await creditRequestService.createRequest(payload);
      }

      // If not admin and newly created, request approval workflow (optional, depends on backend logic)
      if (!isApproved && !isEditing && requestApproval) {
        await requestApproval({
          type: "credit",
          itemId: String(savedRequest.id),
          itemNumber: `${form.clientName} - QAR ${payload.amount.toLocaleString()}`,
          division: "all",
          amount: payload.amount,
          notes: `Reason: ${form.reason}. Additional notes: ${form.notes}`
        });
      }

      // Refresh history from API
      const updatedHistory = await creditRequestService.getAllRequests();
      setRecentRequests(updatedHistory);
      
      const activityMessage = isEditing
        ? `Updated Credit Request for ${form.clientName}`
        : (isApproved 
          ? `Approved Credit Limit for ${form.clientName}`
          : `Requested Credit Limit for ${form.clientName} (Pending Approval)`);
      
      if (logActivity) {
        await logActivity(activityMessage, "finance", "/admin/approvals", form.clientName);
      }

      // Fire notification to the client
      try {
         const statusLabel = form.approvalStatus.toUpperCase();
         await api.post("/notifications/credit-request", {
            clientId: form.clientId,
            amount: form.requestedLimit,
            reason: isEditing 
              ? `Your credit limit request of QAR ${payload.amount.toLocaleString()} has been ${statusLabel} by the admin.`
              : form.reason
         });
      } catch (notifErr) {
         console.warn("Failed to notify client:", notifErr);
      }
      
      alert(isEditing ? "Credit request updated successfully." : "Credit request saved successfully.");
      
      if (isEditing) {
        navigate("/credit-requests");
        return;
      }
      
      // Clear form
      setForm({
        clientId: "",
        clientName: "",
        requestedLimit: "",
        reason: "",
        notes: "",
        approvalStatus: "pending",
      });
    } catch (err: any) {
      console.error("Credit Request Error:", err);
      alert("Failed to submit credit request: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEditing ? "Edit Credit Request" : "Request Credit Limit"}
          subtitle={isEditing ? "Update existing credit request details" : "Submit a request for client credit limit approval"}
        />
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1 relative">
                <label className="text-sm text-gray-600">Select Client *</label>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={(e) => {
                    const selectedClient = clients.find(c => c.id?.toString() === e.target.value);
                    const displayName = selectedClient ? (selectedClient.contactPerson && selectedClient.contactPerson !== "N/A" ? selectedClient.contactPerson : selectedClient.name) : "";
                    setForm(prev => ({ 
                        ...prev, 
                        clientId: e.target.value, 
                        clientName: displayName 
                    }));
                  }}
                  required
                  className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow ${
                    isEditing ? "bg-slate-50 cursor-not-allowed text-slate-500 font-medium" : "bg-white"
                  }`}
                  disabled={isLoadingClients || isEditing}
                >
                  <option value="">{isLoadingClients ? "Loading clients..." : "-- Select a Client --"}</option>
                  {filteredClients.map((client: any) => {
                    const displayName = client.contactPerson && client.contactPerson !== "N/A" ? client.contactPerson : client.name;
                    return (
                      <option key={client.id} value={client.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <FormInput
                label="Requested Credit Limit (QAR) *"
                type="number"
                name="requestedLimit"
                value={form.requestedLimit}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="no-spinner"
              />

              <div className="col-span-2">
                <FormInput
                  label="Primary Reason for Credit *"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="e.g. New project requirement, long-term partnership"
                  required
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Status
            </h3>
            <div className="max-w-xs">
              <select
                name="approvalStatus"
                value={form.approvalStatus}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-blue-50/50 text-blue-800 font-bold"
              >
                <option value="pending">PENDING</option>
                <option value="approved">APPROVED</option>
                <option value="due">DUE</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Additional Support
            </h3>
            <FormTextarea
              label="Supporting Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional details to support this request..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 text-white px-8 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Landmark size={18} />
                  {isEditing ? "Update Request" : "Submit Request"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {recentRequests.length > 0 && (
        <div className="mt-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl opacity-100 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Recent Requests History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-600">Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Client</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Amount (QAR)</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req: any, i: number) => (
                  <tr key={req.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600">
                      {req.created_at || req.createdAt ? new Date(req.created_at || req.createdAt).toLocaleDateString() : ""}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {req.client_name || req.clientName}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <ApprovalBadge status={req.approval_status || req.approvalStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditRequest;
