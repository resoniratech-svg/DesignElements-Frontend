import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/PageLoader";
import StatCard from "../../components/StatCard";
import { Banknote, TrendingUp, CreditCard, Plus, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import ChartCard from "../../components/ChartCard";
import StatusBadge from "../../components/StatusBadge";
import ApprovalBadge from "../../components/ApprovalBadge";
import { accountsService } from "../../services/accountsService";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    AreaChart,
    Area,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import type { AccountsDashboardData } from "../../types/finance";

export default function AccountsDashboard() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery<AccountsDashboardData>({
        queryKey: ["accounts-stats"],
        queryFn: accountsService.getDashboardStats
    });

    if (isLoading || !data) {
        return <PageLoader message="Consolidating Financial Ledgers..." />;
    }

    const { stats, financialData, recentInvoices } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Accounting & Finance
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time financial monitoring and invoice management.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/create-invoice" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-brand-500/20 flex items-center gap-2">
                        <Plus size={16} /> New Invoice
                    </Link>
                    <Link to="/create-expense" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
                        <Banknote size={16} /> File Expense
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Receivables"
                    value={`QAR ${stats.receivables.toLocaleString()}`}
                    icon={<Banknote size={20} className="text-emerald-500" />}
                    trend={{ value: "Pending payments", positive: true }}
                    path="/invoices"
                    className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Total Payables"
                    value={`QAR ${stats.payables.toLocaleString()}`}
                    icon={<CreditCard size={20} className="text-rose-500" />}
                    trend={{ value: "Unpaid expenses", positive: false }}
                    path="/expenses"
                    className="hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Pending Approvals"
                    value={`QAR ${stats.pendingPayments.toLocaleString()}`}
                    icon={<Clock size={20} className="text-amber-500" />}
                    trend={{ value: "Awaiting review", positive: true }}
                    path="/approvals"
                    className="hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Net Profit Margin"
                    value={`${stats.profitMargin}%`}
                    icon={<TrendingUp size={20} className="text-brand-500" />}
                    trend={{ value: "Revenue vs Cost", positive: Number(stats.profitMargin) >= 0 }}
                    path="/financial-reports"
                    className="hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Revenue vs Expenses" className="lg:col-span-2">
                    <div className="h-[320px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `QAR ${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="receivables" name="Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="payables" name="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-4 flex-1">
                        <button onClick={() => navigate('/invoices')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-brand-50 hover:border-brand-100 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">Manage Receivables</p>
                                    <p className="text-xs text-gray-500">Track client payments</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => navigate('/expenses')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-brand-50 hover:border-brand-100 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <ArrowDownRight size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">Track Payables</p>
                                    <p className="text-xs text-gray-500">Vendor & staff expenses</p>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => navigate('/financial-reports')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-brand-50 hover:border-brand-100 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">Financial Reports</p>
                                    <p className="text-xs text-gray-500">P&L and Balance Sheets</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                    <Link to="/ledger" className="text-sm text-brand-600 font-bold hover:underline">View Ledger</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Ref ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-right">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/invoice-details/${inv.id}`)}>
                                    <td className="px-6 py-4 font-bold text-brand-600">{inv.invoiceNo || inv.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{inv.client}</td>
                                    <td className="px-6 py-4 font-black">QAR {Number(inv.total || inv.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                                    <td className="px-6 py-4 text-right"><ApprovalBadge status={inv.approvalStatus || "approved"} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


