import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/PageLoader";
import StatCard from "../../components/StatCard";
import { Folder, CheckCircle, Plus, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { pmService } from "../../services/pmService";



export default function PMDashboard() {

    const { data, isLoading } = useQuery({
        queryKey: ["pm-stats"],
        queryFn: pmService.getDashboardStats
    });

    if (isLoading || !data) {
        return <PageLoader message="Coordinating Project Schedules..." />;
    }

    const stats = data?.stats || { activeProjects: 0, ongoingJobs: 0, completedJobs: 0, overdueTasks: 0 };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Project Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor project progress, job assignments, and deadlines.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/create-project" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-brand-500/20 flex items-center gap-2">
                        <Plus size={16} /> New Project
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects.toString()}
                    icon={<Folder size={20} className="text-brand-500" />}
                    path="/projects"
                />
                <StatCard
                    title="Inactive Projects"
                    value={stats.inactiveProjects.toString()}
                    icon={<Briefcase size={20} className="text-gray-500" />}
                    path="/projects"
                />
                <StatCard
                    title="Completed Projects"
                    value={stats.completedProjects.toString()}
                    icon={<CheckCircle size={20} className="text-emerald-500" />}
                    path="/projects"
                />
            </div>

        </div>
    );
}
