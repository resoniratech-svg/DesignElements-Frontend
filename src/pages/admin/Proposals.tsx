import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import type { Proposal } from "../../types/pm";

interface ProposalsProps {
    filter?: "Draft" | "Templates" | string;
}

function Proposals({ filter }: ProposalsProps) {
    const { logActivity } = useActivity();
    const { user } = useAuth();

    const [rawProps, setRawProps] = useState<Proposal[]>(() =>
        JSON.parse(localStorage.getItem("trek_proposals") || "[]")
    );

    const hasFullAccess = user?.role === "SUPER_ADMIN" || user?.role === "PROJECT_MANAGER";

    const handleDelete = useCallback((id: string, proposalNo: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete proposal ${proposalNo}?`);
        if (!confirmed) return;

        const filtered = rawProps.filter((p) => p.id !== id);
        localStorage.setItem("trek_proposals", JSON.stringify(filtered));
        setRawProps(filtered);

        logActivity(`Deleted Proposal ${proposalNo}`, "role", "/proposals", proposalNo);
    }, [rawProps, logActivity]);

    const proposals = useMemo(() => {
        let filteredData = rawProps;

        if (filter === "Draft") {
            filteredData = rawProps.filter((p) => p.status === "Draft");
        } else if (filter === "Templates") {
            filteredData = rawProps.filter((p) => p.isTemplate);
        } else {
            filteredData = rawProps.filter((p) => !p.isTemplate);
        }

        return filteredData.map((prop) => ({
            ...prop,
            "Proposal ID": prop.proposalNo,
            "Client Name": prop.client,
            "Prepared For": prop.preparedFor || prop.client,
            "Total Package Cost": `QAR ${Number(prop.totalPackageCost || prop.amount || 0).toLocaleString()}`,
            "Status": <StatusBadge status={prop.status} />,
            "Created Date": prop.date,
            "Actions": (
                <div className="flex gap-2">
                    <Link to={`/proposal-details/${prop.id}`} title="View Details" className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
                        <Eye size={16} />
                    </Link>
                    {hasFullAccess && (
                        <>
                            <Link to={`/edit-proposal/${prop.id}`} title="Edit" className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                <Edit size={16} />
                            </Link>
                            <button title="Delete" onClick={() => handleDelete(prop.id, prop.proposalNo)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            )
        }));
    }, [rawProps, filter, hasFullAccess, handleDelete]);

    const columns = ["Proposal ID", "Client Name", "Prepared For", "Total Package Cost", "Status", "Created Date", "Actions"];

    const getTitle = () => {
        if (filter === "Draft") return "Draft Proposals";
        // if (filter === "Templates") return "Proposal Templates";
        return "Business Proposals";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{getTitle()}</h1>
                    <p className="text-slate-500">Manage and track service proposals for clients</p>
                </div>
                {hasFullAccess && filter !== "Templates" && (
                    <Link
                        to="/create-proposal"
                        className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                    >
                        <Plus size={16} />
                        Create Proposal
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <DataTable columns={columns} data={proposals} />
                {proposals.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        No proposals found.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Proposals;
