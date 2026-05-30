import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import {
  FileText,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Search,
  Eye,
  Download
} from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { useCreditControl } from "../../hooks/useCreditControl";
import { exportToCSV } from "../../utils/exportUtils";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import AddPaymentModal from "../../components/modals/AddPaymentModal";
import InvoiceDetailDrawer from "../../components/drawers/InvoiceDetailDrawer";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Paid, Partial, Overdue

export default function CreditControl() {
  const { activeDivision } = useDivision();
  const {
    loading,
    summary,
    invoices,
    fetchSummary,
    fetchInvoices
  } = useCreditControl();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal/Drawer States
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSummary({
      division: activeDivision === "all" ? undefined : activeDivision,
    });
    fetchInvoices({
      division: activeDivision === "all" ? undefined : activeDivision,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined
    });
  }, [activeDivision, statusFilter, searchTerm, fetchSummary, fetchInvoices]);

  const refreshData = () => {
    fetchSummary({
      division: activeDivision === "all" ? undefined : activeDivision,
    });
    fetchInvoices({
      division: activeDivision === "all" ? undefined : activeDivision,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined
    });
  };

  const chartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Collected", value: summary.totalCollected },
      { name: "Pending", value: summary.pendingPayments },
      { name: "Due", value: summary.dueAmount || 0 },
    ];
  }, [summary]);


  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Control & Payment Tracking"
        subtitle="Monitor outstanding balances, track collections, and manage payment alerts."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Invoiced"
          value={`QAR ${summary?.totalInvoiced ? summary.totalInvoiced.toLocaleString() : '0'}`}
          icon={<FileText size={20} className="text-blue-500" />}
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "ring-2 ring-brand-500" : ""}
        />
        <StatCard
          title="Total Collected"
          value={`QAR ${summary?.totalCollected ? summary.totalCollected.toLocaleString() : '0'}`}
          icon={<CreditCard size={20} className="text-emerald-500" />}
          trend={{
            value: summary?.totalInvoiced ? `${((summary.totalCollected / summary.totalInvoiced) * 100).toFixed(1)}%` : '0%',
            positive: true
          }}
          onClick={() => setStatusFilter("PAID")}
          className={statusFilter === "PAID" ? "ring-2 ring-brand-500" : ""}
        />
        <StatCard
          title="Pending Payments"
          value={`QAR ${summary?.pendingPayments ? summary.pendingPayments.toLocaleString() : '0'}`}
          icon={<TrendingUp size={20} className="text-amber-500" />}
          onClick={() => setStatusFilter("UNPAID")}
          className={statusFilter === "UNPAID" ? "ring-2 ring-brand-500" : ""}
        />
        <StatCard
          title="Due Invoices"
          value={`QAR ${summary?.dueAmount ? summary.dueAmount.toLocaleString() : '0'}`}
          trend={{
            value: `${summary?.overdueCount || 0} Invoices`,
            positive: false
          }}
          icon={<AlertCircle size={20} className="text-rose-500" />}
          onClick={() => setStatusFilter("DUE")}
          className={statusFilter === "DUE" ? "ring-2 ring-brand-500" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ChartCard title="Payment Status Distribution">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.name === "Collected" ? COLORS[0] : entry.name === "Pending" ? COLORS[1] : COLORS[2] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-800">Invoices & Collections</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search client/invoice..."
                    className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-brand-500 w-full sm:w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="bg-slate-50 border-none rounded-lg text-xs py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-brand-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="DUE">Due</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Invoice ID</th>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3 text-right">Total Amount</th>
                      <th className="px-5 py-3 text-right">Collected</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.length > 0 ? invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4 font-bold text-brand-600">{inv.invoice_number}</td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{inv.client_name}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-medium">QAR {inv.total_amount.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-medium text-emerald-600">QAR {inv.amount_paid.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-bold ${inv.balance_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            QAR {inv.balance_amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${inv.status === "PAID" ? "bg-emerald-100 text-emerald-600" :
                            inv.status === "PARTIAL" ? "bg-amber-100 text-amber-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsDrawerOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic">No invoices found matching criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Extra Analytics */}
        <div className="space-y-6">


          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {

                  let exportInvoices = [];

                  // EXPORT BASED ON CURRENT FILTER
                  if (statusFilter === "DUE") {

                    exportInvoices = invoices.filter(i =>
                      i.status?.toUpperCase() === 'DUE' ||
                      (
                        i.balance_amount > 0 &&
                        i.due_date &&
                        new Date(i.due_date) < new Date()
                      )
                    );

                  } else if (statusFilter === "UNPAID") {

                    exportInvoices = invoices.filter(i =>
                      i.status?.toUpperCase() === 'UNPAID' ||
                      i.status?.toUpperCase() === 'PENDING'
                    );

                  } else if (statusFilter === "PAID") {

                    exportInvoices = invoices.filter(i =>
                      i.status?.toUpperCase() === 'PAID'
                    );

                  } else {

                    // ALL STATUS
                    exportInvoices = invoices;
                  }

                  if (exportInvoices.length === 0) {

                    alert('No invoices to export.');

                    return;
                  }

                  const data = exportInvoices.map(i => ({

                    'Invoice No': i.invoice_number,

                    'Client': i.client_name,

                    'Total Amount': i.total_amount,

                    'Collected': i.amount_paid,

                    'Balance': i.balance_amount,

                    'Status': i.status,

                    'Due Date': i.due_date || '-',

                    'Invoice Date': i.invoice_date || i.created_at || '-'
                  }));

                  exportToCSV(
                    data,
                    `${statusFilter.toLowerCase()}_invoices.csv`
                  );
                }}
                className="flex flex-col items-center justify-center p-3 border border-slate-50 rounded-xl hover:bg-brand-50 hover:border-brand-100 transition-all gap-2 group col-span-2"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Download size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">Export Invoices</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <InvoiceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invoice={selectedInvoice}
        onAddPayment={() => setIsModalOpen(true)}
      />

      {/* Payment Modal */}
      {selectedInvoice && (
        <AddPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
