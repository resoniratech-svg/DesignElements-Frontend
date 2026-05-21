import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../../services/financeService";
import { Link } from "react-router-dom";
import { getUploadUrl } from "../../services/api";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
// Removed unused ApprovalBadge import
import { Plus, Trash2, Eye, Receipt, Edit, DollarSign } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import type { Expense } from "../../types/finance";

const DIVISION_FILTERS = [
  { value: "all", label: "All Divisions" },
  { value: "trading", label: "Trading Sector" },
  { value: "contracting", label: "Contracting Sector" },
];

function Expenses() {
  const { activeDivision } = useDivision();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: dbExpenses = [] } = useQuery({
    queryKey: ["expenses", activeDivision],
    queryFn: () => financeService.getExpenses()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => financeService.deleteExpense(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string | number) => financeService.approveExpense(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string | number) => financeService.rejectExpense(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    }
  });

  const loadExpenses = () => {
    // Map backend expense fields array to frontend objects
    const persisted: any[] = dbExpenses.map((dbExp: any) => ({
      id: dbExp.id,
      date: dbExp.date ? dbExp.date.split(/[T ]/)[0] : "",
      expenseName: dbExp.description,
      category: dbExp.category,
      amount: dbExp.total_amount,
      division: dbExp.allocations && dbExp.allocations.length === 1
        ? dbExp.allocations[0].division.toLowerCase()
        : (dbExp.allocation_type?.toLowerCase() || "all"),
      approvalStatus: dbExp.approval_status?.toLowerCase() === "pending_approval"
        ? "pending"
        : dbExp.approval_status?.toLowerCase() === "rejected"
          ? "rejected"
          : dbExp.approval_status?.toLowerCase() === "approved"
            ? "approved"
            : "pending",
      vendor: dbExp.vendor || "Internal",
      paymentMethod: dbExp.payment_method || "Transfer",
      attachment: dbExp.attachment || null
    }));

    // Global Filtering logic
    const filteredByGlobal = activeDivision === "all"
      ? persisted
      : persisted.filter(e => {
        const divId = e.division || e.referenceType || e.branch?.toLowerCase();
        return divId?.toLowerCase() === activeDivision.toLowerCase();
      });

    setRawExpenses(filteredByGlobal);

    // Extract unique categories from globally filtered data
    const uniqueCategories = [
      ...new Set(filteredByGlobal.map((e) => e.category).filter(Boolean)),
    ];
    setCategories(uniqueCategories as string[]);
  };

  useEffect(() => {
    loadExpenses();
  }, [activeDivision, dbExpenses]);

  useEffect(() => {
    let filtered = [...rawExpenses];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    if (approvalFilter === "approved") {
      filtered = filtered.filter((e) => e.approvalStatus === "approved" || !e.approvalStatus);
    } else if (approvalFilter === "pending") {
      filtered = filtered.filter((e) => e.approvalStatus === "pending");
    }

    const formattedData = filtered.map((expense) => ({
      ...expense,
      Date: expense.date || "-",
      "Expense Name": expense.expenseName || expense.description || "-",
      Category: expense.category || "-",
      Division:
        expense.divisionLabel ||
        DIVISION_FILTERS.find((d) => d.value === (expense.division || expense.referenceType || "general"))
          ?.label ||
        "General",
      Vendor: expense.vendor || "-",
      "Payment Method": expense.paymentMethod || "-",
      Amount: `QAR ${Number(expense.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "Receipt Doc": expense.attachment ? (
        <a
          href={getUploadUrl(expense.attachment)}
          target="_blank"
          rel="noreferrer"
          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-full font-medium transition-colors inline-block cursor-pointer"
        >
          📎 {expense.attachment.split('/').pop()}
        </a>
      ) : (
        <span className="text-slate-300 text-xs">None</span>
      ),
      Actions: (
        <div className="flex gap-2 items-center">
          <Link
            to={`/expense-details/${expense.id}`}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </Link>
          <Link
            to={`/edit-expense/${expense.id}`}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
            title="Edit Expense Details"
          >
            <Edit size={16} />
          </Link>
          <button
            onClick={() => handleDelete(expense.id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }));

    setExpenses(formattedData);
  }, [rawExpenses, categoryFilter, approvalFilter, approveMutation.isPending, rejectMutation.isPending, deleteMutation.isPending]);

  // Removed unused handleToggleApproval function

  const handleDelete = (id: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  // Stats calculations based on current view (already filtered by global division)
  const totalAmount = rawExpenses
    .filter(e => e.approvalStatus === "approved" || !e.approvalStatus)
    .reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

  const pendingAmount = rawExpenses
    .filter(e => e.approvalStatus === "pending")
    .reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

  const pendingCount = rawExpenses.filter(e => e.approvalStatus === "pending").length;

  const topCategory =
    rawExpenses.length > 0
      ? Object.entries(
        rawExpenses.reduce((acc: Record<string, number>, e) => {
          const cat = e.category || "Uncategorized";
          acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
          return acc;
        }, {})
      ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
      : "N/A";

  const columns = [
    "Date",
    "Expense Name",
    "Category",
    "Division",
    "Vendor",
    "Payment Method",
    "Amount",
    "Receipt Doc",
    "Actions",
  ];

  return (
    <div className="p-6">
      <PageHeader showBack
        title="Expense Management"
        subtitle="Track and manage all company and project expenditures"
        action={
          <Link to="/create-expense">
            <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
              <Plus size={16} />
              Add Expense
            </button>
          </Link>
        }
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={activeDivision === "all" ? "Total Approved" : `Approved (${DIVISIONS.find(d => d.id === activeDivision)?.label})`}
          value={`QAR ${totalAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={<DollarSign size={20} />}
          onClick={() => setApprovalFilter("approved")}
        />
        <StatCard
          title="Pending Approval"
          value={`QAR ${pendingAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={<div className="relative">
            <Receipt size={20} className="text-amber-500" />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
              {pendingCount}
            </span>
          </div>}
          onClick={() => setApprovalFilter("pending")}
        />
        <StatCard
          title="Number of Records"
          value={rawExpenses.length.toString()}
          icon={<Receipt size={20} />}
          onClick={() => setApprovalFilter("all")}
        />
      </div>

      {/* Top Category Banner */}
      {rawExpenses.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-sm text-brand-700 font-medium">
            🏷️ Top Expense Category:
          </span>
          <span className="text-sm font-bold text-brand-800">{topCategory}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[240px]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setCategoryFilter("all");
              setApprovalFilter("all");
            }}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium px-3 py-2 rounded-lg hover:bg-brand-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {expenses.length > 0 ? (
          <DataTable columns={columns} data={expenses} hideSearch={true} />
        ) : (
          <div className="p-12 text-center">
            <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              No expenses found
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {categoryFilter !== "all"
                ? "Try adjusting your filters or add a new expense."
                : "Start tracking your expenses by adding the first one."}
            </p>
            <Link to="/create-expense">
              <button className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition">
                <Plus size={14} className="inline mr-1" /> Add Expense
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;