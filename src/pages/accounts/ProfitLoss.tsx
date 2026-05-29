import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, BookOpen, Download, Loader2 } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { exportToCSV } from "../../utils/exportUtils";
import { DIVISIONS } from "../../constants/divisions";
import { financeService } from "../../services/financeService";

const getYyyyMmDd = (dateVal: any): string => {
  if (!dateVal) return "";
  const str = String(dateVal).trim();
  const match = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
};

function ProfitLoss() {
  const { activeDivision } = useDivision();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, expRes] = await Promise.all([
          financeService.getInvoices(undefined, 1, 1000),
          financeService.getExpenses()
        ]);
        setInvoices(invRes.data || []);
        setExpenses(expRes || []);
      } catch (err) {
        console.error("Failed to fetch P&L data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i: any) => {
      // 1. Division filter
      if (activeDivision !== "all") {
        const branch = (i.division || i.branch || "").toLowerCase();
        if (branch !== activeDivision.toLowerCase()) return false;
      }
      
      // 2. Status filter
      const stat = (i.approval_status || i.approvalStatus || i.status || "").toLowerCase();
      return stat === "approved" || stat === "paid" || !stat;
    });
  }, [invoices, activeDivision]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      // 1. Division filter
      if (activeDivision !== "all") {
        const hasAlloc = e.allocations?.some((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
        if (!hasAlloc) return false;
      }
      
      // 2. Status filter
      const stat = (e.approval_status || e.approvalStatus || e.status || "").toLowerCase();
      return stat === "approved" || stat === "paid" || stat === "completed" || stat === "pending_approval" || !stat;
    });
  }, [expenses, activeDivision]);

  const totalRevenue = useMemo(() => filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0), [filteredInvoices]);
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => {
      if (activeDivision !== "all") {
        const alloc = exp.allocations?.find((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
        return sum + parseFloat(alloc?.amount || 0);
      } else {
        return sum + parseFloat(exp.total_amount || exp.amount || 0);
      }
    }, 0);
  }, [filteredExpenses, activeDivision]);
  const netProfit = totalRevenue - totalExpenses;

  const pendingInvoices = useMemo(() => {
    return invoices.filter((i: any) => {
      if (activeDivision !== "all") {
        const branch = (i.division || i.branch || "").toLowerCase();
        if (branch !== activeDivision.toLowerCase()) return false;
      }
      const stat = (i.approval_status || i.approvalStatus || i.status || "").toLowerCase();
      return stat === "pending" || stat === "unpaid";
    });
  }, [invoices, activeDivision]);

  const pendingExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (activeDivision !== "all") {
        const hasAlloc = e.allocations?.some((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
        if (!hasAlloc) return false;
      }
      const stat = (e.approval_status || e.approvalStatus || e.status || "").toLowerCase();
      return stat === "pending" || stat === "pending_approval";
    });
  }, [expenses, activeDivision]);

  const pendingRevenue = useMemo(() => pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0), [pendingInvoices]);
  const pendingExpensesAmt = useMemo(() => {
    return pendingExpenses.reduce((sum, exp) => {
      if (activeDivision !== "all") {
        const alloc = exp.allocations?.find((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
        return sum + parseFloat(alloc?.amount || 0);
      } else {
        return sum + parseFloat(exp.total_amount || exp.amount || 0);
      }
    }, 0);
  }, [pendingExpenses, activeDivision]);

  // Taxation calculations
  const outputVAT = useMemo(() => filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.tax_amount || inv.taxAmount || 0), 0), [filteredInvoices]);
  const inputVAT = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => {
      const tax = parseFloat(exp.tax_amount || exp.taxAmount || 0);
      if (activeDivision !== "all") {
        const alloc = exp.allocations?.find((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
        const pct = parseFloat(alloc?.percentage || 0) / 100;
        return sum + (tax * pct);
      } else {
        return sum + tax;
      }
    }, 0);
  }, [filteredExpenses, activeDivision]);
  const netVAT = outputVAT - inputVAT;

  const divisionBreakdown = useMemo(() => {
    return DIVISIONS.map(div => {
      const mappedDiv = div.id.toLowerCase();
      const divInvoices = invoices.filter(i => {
        const branch = (i.division || i.branch || "").toLowerCase();
        const stat = (i.approval_status || i.approvalStatus || i.status || "").toLowerCase();
        return branch === mappedDiv && (stat === "approved" || stat === "paid" || !stat);
      });
      const divExpenses = expenses.filter(e => {
        const hasAlloc = e.allocations?.some((a: any) => a.division?.toLowerCase() === mappedDiv);
        const stat = (e.approval_status || e.approvalStatus || e.status || "").toLowerCase();
        return hasAlloc && (stat === "approved" || stat === "paid" || stat === "completed" || stat === "pending_approval" || !stat);
      });
      
      const revenue = divInvoices.reduce((s, i) => s + parseFloat(i.total_amount || i.total || i.amount || 0), 0);
      const exps = divExpenses.reduce((s, e) => {
        const alloc = e.allocations?.find((a: any) => a.division?.toLowerCase() === mappedDiv);
        return s + parseFloat(alloc?.amount || 0);
      }, 0);
      
      return {
        name: div.label,
        revenue,
        expenses: exps,
        profit: revenue - exps
      };
    });
  }, [invoices, expenses]);

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, idx) => {
      const monthIncome = filteredInvoices
        .filter(inv => {
          const itemDate = inv.invoice_date || inv.date || inv.created_at;
          const dateStr = getYyyyMmDd(itemDate);
          if (!dateStr) return false;
          const itemYear = Number(dateStr.substring(0, 4));
          const itemMonth = Number(dateStr.substring(5, 7)) - 1;
          return itemMonth === idx && itemYear === 2026;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0);

      const monthExpense = filteredExpenses
        .filter(exp => {
          const itemDate = exp.date || exp.created_at;
          const dateStr = getYyyyMmDd(itemDate);
          if (!dateStr) return false;
          const itemYear = Number(dateStr.substring(0, 4));
          const itemMonth = Number(dateStr.substring(5, 7)) - 1;
          return itemMonth === idx && itemYear === 2026;
        })
        .reduce((sum, exp) => {
          if (activeDivision !== "all") {
            const alloc = exp.allocations?.find((a: any) => a.division?.toLowerCase() === activeDivision.toLowerCase());
            return sum + parseFloat(alloc?.amount || 0);
          } else {
            return sum + parseFloat(exp.total_amount || exp.amount || 0);
          }
        }, 0);

      return { name: month, Revenue: monthIncome, Expenses: monthExpense };
    });
  }, [filteredInvoices, filteredExpenses, activeDivision]);

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-brand-600" />
        <p className="text-lg font-medium">Generating P&L Report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 p-6">
      <PageHeader 
        title={activeDivision === "all" ? "Profit & Loss Report" : `${currentDivision?.label} P&L Report`}
        subtitle={activeDivision === "all" ? "Track company revenue and expenses over time" : `Financial performance for the ${currentDivision?.label}`}
        action={
            <button 
                onClick={() => exportToCSV(chartData, 'profit_loss_report.csv')}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all"
            >
                <Download size={16} /> Export Report
            </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalRevenue.toLocaleString()}</p>
          {pendingRevenue > 0 && <p className="text-xs text-amber-600 mt-2 font-medium">+{pendingRevenue.toLocaleString()} pending</p>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalExpenses.toLocaleString()}</p>
          {pendingExpensesAmt > 0 && <p className="text-xs text-amber-600 mt-2 font-medium">+{pendingExpensesAmt.toLocaleString()} pending</p>}
        </div>

        <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow text-white ${netProfit >= 0 ? "bg-brand-600" : "bg-rose-600"}`}>
          <p className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Net {netProfit >= 0 ? "Profit" : "Loss"}</p>
          <p className="text-3xl font-bold">QAR {Math.abs(netProfit).toLocaleString()}</p>
          <div className="mt-2 text-[10px] font-medium opacity-70 uppercase">Approved only</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow text-white">
          <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Projected Position</p>
          <p className="text-3xl font-bold text-emerald-400">QAR {(netProfit + pendingRevenue - pendingExpensesAmt).toLocaleString()}</p>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Taxation Summary</p>
            <p className="text-xs font-medium text-slate-300">Net VAT: QAR {netVAT.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {activeDivision === "all" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500"></span> Division Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Division</th>
                  <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-right">Expenses</th>
                  <th className="px-6 py-4 font-semibold text-right">Profit</th>
                  <th className="px-6 py-4 font-semibold text-right">Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {divisionBreakdown.map((div, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{div.name}</td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">QAR {div.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right text-rose-600 font-medium">QAR {div.expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right font-black text-emerald-700">
                      {div.profit >= 0 ? `QAR ${div.profit.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-rose-700">
                      {div.profit < 0 ? `QAR ${Math.abs(div.profit).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6 font-mono tracking-tight uppercase flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-500" /> Financial Momentum (2026)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `QAR ${value.toLocaleString()}`} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table Link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-center p-12">
           <h3 className="text-lg font-bold text-gray-800 mb-2">Detailed Financial Breakdown</h3>
           <p className="text-slate-500 mb-6">Full ledger breakdown for the selected sector is available in the General Ledger system.</p>
           <Link to="/ledger" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">
             <BookOpen size={18} /> View General Ledger
           </Link>
      </div>
    </div>
  );
}

export default ProfitLoss;