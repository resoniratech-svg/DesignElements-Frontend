import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import { DIVISIONS } from "../../constants/divisions";
import type { DivisionId } from "../../constants/divisions";
import FileUploader from "../../components/FileUploader";
import { financeService } from "../../services/financeService";
import { projectService } from "../../services/projectService";
import { quotationService } from "../../services/quotationService";
import { formatWithCommas, stripCommas } from "../../utils/numberFormat";

const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Office Expenses",
  "Materials & Supplies",
  "Salaries & Wages",
  "Transportation",
  "Documentation Renewals",
  "Equipment Rental",
  "Subcontractor Fees",
  "Utilities",
  "Insurance",
  "Maintenance & Repairs",
  "Marketing & Advertising",
  "Legal & Professional",
  "Miscellaneous",
  "Custom Other",
];

const DEPARTMENT_CHOICES = [
  { id: "Administrative Office", label: "Administrative Office", icon: "🏢", description: "HQ, HR, Finance, Executive" },
  { id: "Sales / Marketing", label: "Sales / Marketing", icon: "📈", description: "Business Dev, Client Acquisition" },
  { id: "Operations / Logistics", label: "Operations / Logistics", icon: "🚚", description: "Site Operations, Delivery, Warehouse" },
  { id: "Custom Other", label: "Custom Other", icon: "✍️", description: "Specify a custom department" }
];

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Cheque",
  "Online Payment",
];

// Prefix maps removed as backend handles sequences

interface ReferenceOption {
  id: string;
  label: string;
}

interface ExpenseForm {
  expenseName: string;
  category: string;
  customCategory: string;
  department: string;
  customDepartment: string;
  division: string;
  referenceId: string;
  amount: string;
  taxRate: number;
  taxAmount: number;
  vendor: string;
  paymentMethod: string;
  date: string;
  attachment: string;
  notes: string;
  allocationType: "SINGLE" | "SMART";
  allocations: {
    contracting: number;
    trading: number;
  };
  approvalStatus: string;
}

function CreateExpense() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { activeDivision } = useDivision();
  const { user } = useAuth();
  const { logActivity } = useActivity();
  const [referenceOptions, setReferenceOptions] = useState<ReferenceOption[]>([]);

  const [form, setForm] = useState<ExpenseForm>({
    expenseName: "",
    category: "",
    customCategory: "",
    department: "Administrative Office",
    customDepartment: "",
    division: activeDivision === "all" ? "" : activeDivision.toUpperCase(),
    referenceId: "",
    amount: "",
    taxRate: 0,
    taxAmount: 0,
    vendor: "",
    paymentMethod: "",
    date: new Date().toISOString().split("T")[0],
    attachment: "",
    notes: "",
    allocationType: "SINGLE",
    allocations: {
      contracting: 0,
      trading: 0
    },
    approvalStatus: "pending"
  });

  const { data: dbExpense, isLoading: isFetching } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => financeService.getExpense(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (dbExpense) {
      const rawDept = dbExpense.department || "";
      const isPredefined = ["Administrative Office", "Sales / Marketing", "Operations / Logistics"].includes(rawDept);
      const initialDept = isPredefined ? rawDept : (rawDept ? "Custom Other" : "Administrative Office");
      const initialCustom = isPredefined ? "" : rawDept;

      const rawCat = dbExpense.category || "";
      const isPredefinedCat = EXPENSE_CATEGORIES.filter(c => c !== "Custom Other").includes(rawCat);
      const initialCat = isPredefinedCat ? rawCat : (rawCat ? "Custom Other" : "");
      const initialCustomCat = isPredefinedCat ? "" : rawCat;

      setForm(prev => ({
        ...prev,
        expenseName: dbExpense.description || "",
        category: initialCat,
        customCategory: initialCustomCat,
        department: initialDept,
        customDepartment: initialCustom,
        division: (dbExpense.allocation_type === "SMART" ? "all" : (dbExpense.allocations?.[0]?.division?.toLowerCase() || dbExpense.division?.toLowerCase() || "contracting")) as DivisionId,
        referenceId: dbExpense.reference_id || "",
        amount: dbExpense.total_amount ? formatWithCommas(dbExpense.total_amount) : "",
        taxRate: Number(dbExpense.tax_rate) || 0,
        taxAmount: Number(dbExpense.tax_amount) || 0,
        vendor: dbExpense.vendor || "",
        paymentMethod: dbExpense.payment_method || "",
        date: dbExpense.date ? dbExpense.date.split(/[T ]/)[0] : prev.date,
        attachment: dbExpense.attachment || "",
        notes: dbExpense.notes || "",
        allocationType: dbExpense.allocation_type || "SINGLE",
        allocations: (dbExpense.allocations || []).reduce((acc: any, curr: any) => {
          const div = curr.division?.toLowerCase();
          if (div === "contracting") acc.contracting = Number(curr.amount) || 0;
          if (div === "trading") acc.trading = Number(curr.amount) || 0;
          return acc;
        }, { contracting: 0, trading: 0 }),
        approvalStatus: dbExpense.approval_status?.toLowerCase() === "pending_approval" ? "pending" : dbExpense.approval_status?.toLowerCase()
      }));
    }
  }, [dbExpense]);

  // Load reference options based on division
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const mappedRefType = form.division.toLowerCase();
        const divString = form.division.toLowerCase();

        if (mappedRefType === "contracting" || mappedRefType === "trading") {
          const projRes = await projectService.getProjects(divString, 1, 1000);
          const projects = projRes.data || [];

          const quoteRes = await quotationService.getQuotations(1, 1000, divString);
          const quotations = quoteRes.data || [];

          const options: ReferenceOption[] = [
            ...projects.map((p: any) => ({
              id: p.id!,
              label: `Project: ${p.name || p.projectName}`,
            })),
            ...quotations.map((q: any) => ({
              id: q.id || q.qtn_number,
              label: `Quote: ${q.project_name || q.project || 'No Project'} - ${q.client_name || q.client || 'No Client'}`,
            })),
          ];
          setReferenceOptions(options);
        }
      } catch (err) {
        console.error("Failed to load reference options", err);
        setReferenceOptions([]);
      }
    };

    fetchOptions();
  }, [form.division]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setForm({
        ...form,
        amount: formatWithCommas(value)
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleDivisionChange = (newDivision: DivisionId) => {
    const divisionConfig = DIVISIONS.find(d => d.id === newDivision);
    setForm({
      ...form,
      division: newDivision,
      allocationType: "SINGLE",
      referenceId: "",
      taxRate: divisionConfig?.taxRate || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.division) {
      alert("Please select a Sector (Trading Sector or Contracting Sector).");
      return;
    }

    const selectedCategory = form.category === "Custom Other"
      ? form.customCategory.trim()
      : form.category;

    if (!selectedCategory) {
      alert("Please specify a Category for this expense.");
      return;
    }

    const isApproved = user?.role === "SUPER_ADMIN";
    const amountNum = parseFloat(stripCommas(form.amount)) || 0;

    const selectedDepartment = form.department === "Custom Other"
      ? form.customDepartment.trim()
      : (form.department || null);

    const expenseData: any = {
      category: selectedCategory,
      department: selectedDepartment,
      description: form.expenseName,
      totalAmount: amountNum,
      date: form.date,
      allocationType: "SINGLE",
      division: form.division.toUpperCase(),
      vendor: form.vendor,
      paymentMethod: form.paymentMethod,
      taxRate: Number(form.taxRate) || 0,
      taxAmount: amountNum * (Number(form.taxRate) || 0) / 100,
      referenceId: form.referenceId,
      attachment: form.attachment,
      notes: form.notes,
      allocations: [],
      approval_status: form.approvalStatus === "pending" ? "PENDING_APPROVAL" : form.approvalStatus?.toUpperCase()
    };

    const mutationFn = isEditing
      ? financeService.updateExpense(id!, expenseData)
      : financeService.createExpense(expenseData);

    mutationFn
      .then(async () => {
        const activityMessage = isEditing
          ? `Updated Expense: ${form.expenseName}`
          : (isApproved ? `Recorded Expense: ${form.expenseName}` : `Requested Expense Approval: ${form.expenseName}`);

        logActivity(activityMessage, "finance", "/expenses", form.expenseName);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        if (isEditing) queryClient.invalidateQueries({ queryKey: ["expense", id] });
        navigate("/expenses");
      })
      .catch((err: any) => {
        console.error("EXPENSE SAVE ERROR:", err);
        alert(`Failed to ${isEditing ? 'update' : 'save'} expense: ` + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-full transition-colors"
        >
        </button>
        <PageHeader showBack
          title={isEditing ? "Edit Expense" : "Add New Expense"}
          subtitle={isEditing ? "Update existing expense details" : "Record a new company or project expense"}
        />
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
        {isFetching ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading expense details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Expense Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Expense Name *"
                  name="expenseName"
                  value={form.expenseName}
                  onChange={handleChange}
                  placeholder="e.g. Glass Panel Purchase"
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-white"
                  >
                    <option value="">Select Category</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {form.category === "Custom Other" && (
                    <div className="mt-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        name="customCategory"
                        value={form.customCategory}
                        onChange={(e) => setForm(prev => ({ ...prev, customCategory: e.target.value }))}
                        placeholder="Enter custom category name (e.g. Software, Licensing)..."
                        className="w-full bg-slate-50 border border-brand-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                        required
                      />
                    </div>
                  )}
                </div>

                <FormInput
                  label="Amount (QAR) *"
                  type="text"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="no-spinner"
                />

                {user?.role === "SUPER_ADMIN" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-500 uppercase">Status</label>
                    <select
                      name="approvalStatus"
                      value={form.approvalStatus || "pending"}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-blue-50/50 text-blue-800 font-bold"
                    >
                      <option value="pending">PENDING</option>
                      <option value="approved">APPROVED</option>
                      <option value="rejected">REJECTED</option>
                    </select>
                  </div>
                )}

                <FormInput
                  label="Expense Date *"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="Tax Rate (%)"
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  placeholder="0"
                  className="no-spinner"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Calculated Tax Amount</label>
                  <div className="px-3 py-2 bg-slate-50 border rounded-lg text-slate-500 font-medium">
                    QAR {((parseFloat(stripCommas(form.amount)) || 0) * (Number(form.taxRate) || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Vendor & Payment */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Vendor & Payment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Vendor / Payee *"
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  placeholder="Enter vendor or payee name..."
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    required
                    className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-white"
                  >
                    <option value="">Select Payment Method</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Reference / Linking */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">
                Link to Division / Project
              </h3>
              <div className="space-y-6">
                <DivisionTiles
                  label="1. Select Sector *"
                  selectedId={form.division}
                  onChange={(newId: any) => handleDivisionChange(newId as DivisionId)}
                />

                {form.division ? (
                  <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        2. Select Department / Unit *
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Categorize operational purpose</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DEPARTMENT_CHOICES.map((choice) => {
                        const isSelected = form.department === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, department: choice.id }))}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-brand-600 bg-white shadow-sm ring-2 ring-brand-500/20'
                                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 transition-colors ${
                              isSelected ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {choice.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isSelected ? 'text-brand-900' : 'text-slate-700'}`}>
                                  {choice.label}
                                </span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{choice.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {form.department === "Custom Other" && (
                      <div className="mt-3 bg-white p-3.5 rounded-lg border border-brand-200 animate-in fade-in duration-200">
                        <label className="text-xs font-bold text-brand-900 block mb-1">
                          Specify Custom Department / Division Name *
                        </label>
                        <input
                          type="text"
                          value={form.customDepartment}
                          onChange={(e) => setForm(prev => ({ ...prev, customDepartment: e.target.value }))}
                          placeholder="e.g. Workshop, IT Support, Site Supervision..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                          required
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      👆 Please select a Sector above to choose the Department / Unit.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                      Link to Project / Proposal (Optional)
                    </label>
                    <select
                      name="referenceId"
                      value={form.referenceId}
                      onChange={handleChange}
                      className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-white"
                    >
                      <option value="">-- None --</option>
                      {referenceOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: File Upload */}
            <div>
              {/* File Upload */}
              <div className="mb-5">
                <label className="text-sm font-bold text-slate-700 mb-3 block">
                  Upload Files
                </label>
                <FileUploader
                  existingFiles={
                    form.attachment
                      ? [form.attachment]
                      : []
                  }
                  onUpload={(files: any[], urls: string[]) => {
                    if (urls.length > 0) {
                      setForm(prev => ({
                        ...prev,
                        attachment: urls[0]
                      }));
                    } else if (files.length > 0) {
                      setForm(prev => ({
                        ...prev,
                        attachment: files[0].name
                      }));
                    } else {
                      setForm(prev => ({
                        ...prev,
                        attachment: ""
                      }));
                    }
                  }}
                />
              </div>
              <FormTextarea
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional details about this expense..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="bg-brand-600 text-white px-8 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-sm"
              >
                {isEditing ? "Update Expense" : "Save Expense"}
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
        )}
      </div>
    </div>
  )
}
export default CreateExpense;