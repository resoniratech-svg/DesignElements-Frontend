import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../components/PageHeader";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, Landmark, Scale } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import type { Invoice, Expense } from "../../types/finance";

const ASSET_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#8b5cf6'];
const LIABILITY_COLORS = ['#f43f5e', '#f59e0b', '#ec4899', '#f97316'];

function BalanceSheet() {
  const { activeDivision } = useDivision();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setInvoices(JSON.parse(localStorage.getItem("trek_invoices") || "[]"));
    setExpenses(JSON.parse(localStorage.getItem("trek_expenses") || "[]"));
  }, []);



  const filteredInvoices = useMemo(() => {
    return activeDivision === "all" 
      ? invoices 
      : invoices.filter((i) => {
          const iDiv = (i.branch || i.division || "").toLowerCase();
          return iDiv === activeDivision.toLowerCase();
        });
  }, [invoices, activeDivision]);

  const filteredExpenses = useMemo(() => {
    return activeDivision === "all" 
      ? expenses 
      : expenses.filter((e) => {
          const eDiv = (e.division || "general").toLowerCase();
          return eDiv === activeDivision.toLowerCase();
        });
  }, [expenses, activeDivision]);

  const receivables = useMemo(() => filteredInvoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + Number(inv.total || inv.amount || 0), 0), [filteredInvoices]);

  const payables = useMemo(() => filteredExpenses
    .filter(exp => exp.status !== "Paid")
    .reduce((sum, exp) => sum + Number(exp.amount || 0), 0), [filteredExpenses]);

  // Mocking some cash and assets for a more complete picture, but making them proportional/aware
  const assetsData = [
    { name: 'Cash at Bank', value: receivables * 0.8 },
    { name: 'Accounts Receivable', value: receivables },
    { name: 'Office Equipment', value: 15000 },
  ];

  const liabilitiesData = [
    { name: 'Accounts Payable', value: payables },
    { name: 'Operating Loans', value: payables * 0.2 },
  ];

  const totalAssets = assetsData.reduce((acc, item) => acc + item.value, 0);
  const totalLiabilities = liabilitiesData.reduce((acc, item) => acc + item.value, 0);
  const equity = totalAssets - totalLiabilities;

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  return (
    <div className="space-y-6 pb-12 p-6">
      <PageHeader 
        title={activeDivision === "all" ? "Balance Sheet" : `${currentDivision?.label} Balance Sheet`}
        subtitle={activeDivision === "all" ? "Overview of company assets, liabilities, and equity" : `Financial status for the ${currentDivision?.label}`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 size={64} className="text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Assets</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Landmark size={64} className="text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Liabilities</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Scale size={64} className="text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Total Equity</p>
          <p className="text-3xl font-bold text-emerald-400">QAR {equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Assets Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={ (value) => `QAR ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Liabilities Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liabilitiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {liabilitiesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LIABILITY_COLORS[index % LIABILITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={ (value) => `QAR ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Assets Ledger</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {assetsData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-600">{item.name}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">QAR {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
              <tr className="bg-blue-50/50">
                <td className="px-6 py-4 font-bold text-blue-900">Total Assets</td>
                <td className="px-6 py-4 text-right font-black text-blue-700">QAR {totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Liabilities Ledger</h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {liabilitiesData.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-600">{item.name}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">QAR {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
                <tr className="bg-rose-50/50">
                  <td className="px-6 py-4 font-bold text-rose-900">Total Liabilities</td>
                  <td className="px-6 py-4 text-right font-black text-rose-700">QAR {totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-slate-50">
                  <td className="px-6 py-5 font-bold text-slate-800 text-base uppercase tracking-wider">Total Equity</td>
                  <td className="px-6 py-5 text-right font-black text-emerald-600 text-lg">QAR {equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceSheet;