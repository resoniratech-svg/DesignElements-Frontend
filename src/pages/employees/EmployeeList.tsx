import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Edit2, Trash2, Phone, Mail, Eye, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { DIVISIONS, getDivisionById } from "../../constants/divisions";
import { exportToCSV } from "../../utils/exportUtils";
import { employeeService } from "../../services/employeeService";
import { useDivision } from "../../context/DivisionContext";
import type { Employee } from "../../types/employee";
import type { DivisionId } from "../../constants/divisions";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<DivisionId | "all">(activeDivision);
  const [statusFilter, setStatusFilter] = useState("all");

  // Sync division filter with global activeDivision
  useEffect(() => {
    setDivisionFilter(activeDivision);
  }, [activeDivision]);

  const isClient = user?.role === "CLIENT";

  // Fetch clients to match company name
  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: () => import("../../services/clientService").then(m => m.clientService.getClients({ limit: 1000 })),
    enabled: isClient
  });

  const clients = data?.data || [];

  const [clientCompanyName, setClientCompanyName] = useState(isClient ? (user?.company_name || user?.name || "") : "");

  useEffect(() => {
    if (isClient && clients.length > 0 && user?.id) {
      const myClient = clients.find((c: any) => String(c.userId) === String(user.id));
      if (myClient) {
        setClientCompanyName(myClient.companyName || myClient.name);
      }
    }
  }, [isClient, clients, user]);

  // 1. Fetch Employees
  const { data: employees = [], isLoading, isFetching } = useQuery<Employee[]>({
    queryKey: ["employees", activeDivision],
    queryFn: () => {
        console.log(`[DEBUG] Fetching employees for division: ${activeDivision}`);
        return employeeService.getEmployees(activeDivision);
    }
  });

  console.log(`[DEBUG] EmployeeList render. Employees count: ${employees.length}, Loading: ${isLoading}, Fetching: ${isFetching}`);

  // 2. Mutations
  const deleteMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["employees"] }),
            queryClient.invalidateQueries({ queryKey: ["pro-contracts"] }),
            queryClient.invalidateQueries({ queryKey: ["pro-all-documents"] }),
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] })
        ]);
    },
    onError: (error: Error) => {
        alert(`Failed to delete employee: ${error.message || 'Unknown error'}`);
    }
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Security: Client-only filter
      if (isClient) {
        const filterVal = clientCompanyName || user?.company_name || user?.name;
        if (!filterVal) return false;
        if (emp.company !== filterVal && emp.company !== user?.name) return false;
      }

      const matchesSearch = emp.name?.toLowerCase().includes(search.toLowerCase()) || 
                           String(emp.id).toLowerCase().includes(search.toLowerCase());
      const matchesDivision = divisionFilter === "all" || emp.division?.toUpperCase() === divisionFilter?.toUpperCase();
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [employees, search, divisionFilter, statusFilter, isClient, clientCompanyName, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage and view all staff members across divisions.</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => exportToCSV(filteredEmployees, "employees_export")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
            >
                <Download size={16} />
                Export
            </button>
            {!isClient && (
            <button 
                onClick={() => navigate("/employees/create")}
                className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
            >
                Add Employee
            </button>
            )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {!isClient && (
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <Filter size={16} className="text-gray-400" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">All Divisions</option>
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold text-gray-600">Employee Details</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Division & Role</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                    </tr>
                ))
            ) : filteredEmployees.map((emp) => (
              <tr 
                key={emp.id} 
                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/employees/details/${emp.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs uppercase">
                      {emp.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{emp.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">ID: {emp.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">{getDivisionById(emp.division).label}</span>
                    <span className="text-xs text-gray-400">{emp.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5"><Phone size={12} /> {emp.phone}</span>
                    <span className="flex items-center gap-1.5 text-xs"><Mail size={12} /> {emp.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={emp.status} />
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => navigate(`/employees/details/${emp.id}`)}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {!isClient && (
                      <>
                        <button 
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Confirm delete employee?")) deleteMutation.mutate(emp.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Responsive) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id} 
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group active:bg-gray-50 transition-colors"
            onClick={() => navigate(`/employees/details/${emp.id}`)}
          >
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-brand-100 shadow-sm">
                    {emp.name?.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{emp.name}</h3>
                        <StatusBadge status={emp.status} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                            {emp.role} • {getDivisionById(emp.division).label}
                        </p>
                        <p className="text-xs text-gray-400 font-medium tracking-tight">ID: {emp.id}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0 ml-2">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => navigate(`/employees/details/${emp.id}`)}
                        className="p-2 bg-gray-50 text-gray-500 rounded-lg shrink-0"
                    >
                        <Eye size={14} />
                    </button>
                    {!isClient && (
                      <button 
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="p-2 bg-gray-50 text-gray-500 rounded-lg shrink-0"
                      >
                          <Edit2 size={14} />
                      </button>
                    )}
                </div>
            </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No employees found matching filters.</p>
          </div>
        )}
      </div>
      
      {/* Mobile Infinite Scroll Placeholder / Desktop Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-500">Showing {filteredEmployees.length} employees</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-50" disabled>Next</button>
          </div>
      </div>
    </div>
  );
}
