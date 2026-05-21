import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Printer, Download, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { exportToCSV } from "../../utils/exportUtils";
import { boqService } from "../../services/boqService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

export default function BOQDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const location = useLocation();

    // ✅ NEW: URL Normalizer — Fixes "boq details" space to "boq-details" hyphen
    useEffect(() => {
        if (location.pathname.includes("boq%20details") || location.pathname.includes("boq details")) {
            console.log("[BOQ_DEBUG] Redirecting from space URL to hyphenated URL...");
            navigate(`/boq-details/${id}`, { replace: true });
        }
    }, [location.pathname, navigate, id]);

    const { data: response, isLoading } = useQuery({
        queryKey: ["boq", id],
        queryFn: () => boqService.getBOQById(id!),
        enabled: !!id
    });

    console.log("[BOQ_DEBUG] Page loaded with ID:", id, "User Role:", user?.role);

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string | number, status: string }) => {
            console.log(`[BOQ_SENIOR_DEBUG] Attempting PUT to /api/boqs/${id}/status with status: ${status}`);
            try {
                const res = await api.put(`/boqs/${id}/status`, { status });
                console.log("[BOQ_SENIOR_DEBUG] Server Response:", res.data);
                return res.data;
            } catch (err: any) {
                console.error("[BOQ_SENIOR_DEBUG] API Call Failed:", err.response?.data || err.message);
                throw err;
            }
        },
        onSuccess: (data) => {
            console.log("[BOQ_SENIOR_DEBUG] Mutation SUCCESS:", data);
            queryClient.invalidateQueries({ queryKey: ["boq", id] });
            queryClient.invalidateQueries({ queryKey: ["boqs"] });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.message || err.message || "Failed to update status";
            console.error("[BOQ_SENIOR_DEBUG] Mutation ERROR LOGGED:", errorMsg);
            alert(`CRITICAL ERROR: ${errorMsg}\n\nPlease check the backend terminal for [BOQ_DEBUG] logs.`);
        }
    });

    if (isLoading) return <div className="p-6">Loading BOQ details...</div>;
    
    const boq = response?.data;
    if (!boq) return <div className="p-6">BOQ not found</div>;

    // ✅ SENIOR DIAGNOSTIC: Log exact status with markers to see hidden spaces
    const rawStatus = boq.status || "";
    const normalizedStatus = rawStatus.trim().toUpperCase();
    console.log(`[BOQ_SENIOR_DEBUG] Raw Status: "${rawStatus}" -> Normalized: "${normalizedStatus}"`);
    console.log(`[BOQ_SENIOR_DEBUG] Full BOQ Data:`, JSON.stringify(boq, null, 2));

    const userRoleStr = (user?.role || "").trim().toUpperCase();
    const isAdmin = ["SUPER ADMIN", "SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER", "ADMIN"].includes(userRoleStr);
    const isClient = userRoleStr === "CLIENT";

    const handleStatusUpdate = (newStatus: string) => {
        const fullUrl = `${api.defaults.baseURL || ""}/boqs/${id}/status`;
        console.log(`[BOQ_SENIOR_DEBUG] CLICKED. Target URL: ${fullUrl}, New Status: ${newStatus}`);
        statusMutation.mutate({ id: id!, status: newStatus });
    };

    const totalAmount = boq.items?.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0) || Number(boq.total_amount) || 0;

    return (
        <div className="space-y-6 p-6">


            <PageHeader showBack
                title={`BOQ Details: ${boq.boq_number}`}
                subtitle="Itemized material estimations and project quantities"
                action={
                    <div className="flex gap-3">


                        {isAdmin && normalizedStatus === "UNDER PROCESS" && (
                            <button 
                                onClick={() => handleStatusUpdate("Approved")}
                                disabled={statusMutation.isPending}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                {statusMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                Approve
                            </button>
                        )}

                        {isClient && normalizedStatus === "UNDER PROCESS" && (
                            <>
                                <button 
                                    onClick={() => handleStatusUpdate("Approved")}
                                    disabled={statusMutation.isPending}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    {statusMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate("Rejected")}
                                    disabled={statusMutation.isPending}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-100 disabled:opacity-50"
                                >
                                    {statusMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                    Reject
                                </button>
                            </>
                        )}

                        <div className="h-8 w-px bg-slate-200 mx-1" />

                        <button onClick={() => window.print()} className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            <Printer size={16} /> Print
                        </button>
                        <button 
                            onClick={() => exportToCSV(boq.items?.map((item: any) => ({
                                desc: item.description,
                                qty: item.quantity,
                                uom: item.unit,
                                rate: item.rate,
                                total: item.amount
                            })), `boq_${boq.boq_number}.csv`)} 
                            className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download size={16} /> Export
                        </button>
                        {!isClient && (
                            <button 
                                onClick={() => navigate(`/edit-boq/${id}`)}
                                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        )}
                    </div>
                }
            />

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden text-slate-900">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Project</p>
                            <p className="text-sm text-gray-800 font-bold mt-1">{boq.project_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Client</p>
                            <p className="text-sm text-gray-800 font-bold mt-1">{boq.client_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                            <div className="mt-1">
                                <StatusBadge status={boq.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider">Item Description</th>
                                <th className="text-center px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                <th className="text-center px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {boq.items?.length > 0 ? boq.items?.map((item: any, i: number) => (
                                <tr key={item.id || i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-700 font-medium">{item.description}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">{item.unit}</td>
                                    <td className="px-6 py-4 text-right text-gray-600">QAR {Number(item.rate).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-gray-900 font-bold">QAR {Number(item.amount).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No items added to this BOQ yet.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-brand-50/30 border-t border-brand-100">
                                <td colSpan={4} className="px-6 py-4 text-right font-bold text-gray-700">Net Estimated Total</td>
                                <td className="px-6 py-4 text-right font-bold text-brand-600 text-lg">QAR {totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
