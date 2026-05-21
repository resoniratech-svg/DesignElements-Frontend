import { useQuery } from "@tanstack/react-query";
import StatCard from "../../components/StatCard";
import { Users, UserCheck, AlertCircle, Clock, ChevronRight, Calendar, UserPlus } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { employeeService } from "../../services/employeeService";
import { useDivision } from "../../context/DivisionContext";
import type { EmployeeDashboardData } from "../../types/employee";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { activeDivision } = useDivision();

  const isClient = user?.role === "CLIENT";

  // 1. Fetch Dashboard Stats & Alerts
  const { data: dashboardData, isLoading } = useQuery<EmployeeDashboardData>({
    queryKey: ["employee-dashboard", activeDivision],
    queryFn: () => employeeService.getDashboardStats(activeDivision)
  });

  const stats = dashboardData?.stats || { totalEmployees: 0, activeEmployees: 0, expiringDocs: 0, expiredDocs: 0 };
  // Removed unused alerts variable
  const recentEmployees = dashboardData?.recentEmployees || [];

  if (isLoading) {
    return <PageLoader message="Syncing HR Analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Employee Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of staff statistics and document compliance.</p>
        </div>
        {!isClient && (
          <div className="flex items-center gap-3">
              <Link 
                  to="/employees/create" 
                  className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2"
              >
                  Add Employee
              </Link>
          </div>
        )}
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          icon={<Users size={20} />} 
        />
        <StatCard 
          title="Active Employees" 
          value={stats.activeEmployees} 
          icon={<UserCheck size={20} />} 
        />
        <StatCard 
          title="Expiring Soon" 
          value={stats.expiringDocs} 
          icon={<Clock size={20} />} 
          trend={{ value: "Next 30 days", positive: false }}
        />
        <StatCard 
          title="Expired Documents" 
          value={stats.expiredDocs} 
          icon={<AlertCircle size={20} />} 
        />
      </div>

      {/* Recently Added Employees */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <h2 className="font-bold text-gray-900">Recently Added Employees</h2>
          </div>
        </div>

        {recentEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus size={24} />
            </div>
            <p className="text-gray-500 font-medium">No employees added yet.</p>
            {!isClient && (
              <Link to="/employees/create" className="text-sm text-brand-600 hover:text-brand-700 font-semibold mt-2 inline-block">
                Add your first employee →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 text-left">
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Division</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{emp.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 hidden sm:table-cell">{emp.role || "—"}</td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">
                        {emp.division || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        {emp.joinedDate ? dayjs(emp.joinedDate).format("MMM DD, YYYY") : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        emp.status === "Active" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {emp.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <Link 
                        to={`/employees/details/${emp.id}`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
