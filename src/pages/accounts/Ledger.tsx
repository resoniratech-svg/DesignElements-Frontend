import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../components/PageHeader";
import PageLoader from "../../components/PageLoader";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

import type { Invoice, Expense } from "../../types/finance";

interface LedgerEntry {
    id: string;
    date: string;
    type: "Income" | "Expense";
    description: string;
    reference: string;
    amountIn: number;
    amountOut: number;
    balance: number;
    status: string;
}

export default function Ledger() {
    const navigate = useNavigate();
    const { activeDivision } = useDivision();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">("All");

    const { data: invoicesData, isLoading: invLoading } = useQuery({
        queryKey: ["ledger-invoices"],
        queryFn: async () => {

            const response = await api.get("/invoices");

            console.log("INVOICES API:", response.data);

            return (
                response.data?.data?.data ||
                response.data?.data ||
                []
            );
        }
    });

    const { data: expensesData, isLoading: expLoading } = useQuery({
        queryKey: ["ledger-expenses"],
        queryFn: async () => {

            const response = await api.get("/v1/expenses");

            console.log("EXPENSE API:", response.data);

            return (
                response.data?.expenses ||
                response.data?.data ||
                response.data ||
                []
            );
        }
    });

    useEffect(() => {
        if (invoicesData && Array.isArray(invoicesData)) setInvoices(invoicesData);
        if (expensesData && Array.isArray(expensesData)) setExpenses(expensesData);
    }, [invoicesData, expensesData]);

    const filteredInvoices = useMemo(() => {

        return invoices.filter((i) => {

            const currentDivision =
                String(activeDivision || "ALL")
                    .toUpperCase()
                    .trim();

            if (currentDivision === "ALL") {
                return true;
            }

            const invoiceDivision =
                String(i.division || i.branch || "")
                    .toUpperCase()
                    .trim();

            return invoiceDivision === currentDivision;
        });

    }, [invoices, activeDivision]);

    const getAllocations = (exp: any): any[] => {
        if (!exp?.allocations) return [];
        if (typeof exp.allocations === 'string') {
            try {
                return JSON.parse(exp.allocations);
            } catch (err) {
                console.error("Failed to parse allocations string:", err);
                return [];
            }
        }
        if (Array.isArray(exp.allocations)) return exp.allocations;
        return [];
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const currentDivision = String(activeDivision || "ALL").toUpperCase().trim();
            if (currentDivision === "ALL") {
                return true;
            }

            const allocations = getAllocations(e);
            const hasAllocation = allocations.some(
                (alloc: any) => String(alloc.division).toUpperCase().trim() === currentDivision
            );

            if (hasAllocation) {
                return true;
            }

            const expenseDivision = String(e.division || "").toUpperCase().trim();
            return expenseDivision === currentDivision;
        });
    }, [expenses, activeDivision]);

    const ledgerData = useMemo(() => {
        const entries: LedgerEntry[] = [];

        const formatDate = (dateStr: string) => {
            if (!dateStr) return "";
            return dateStr.split("T")[0].split(" ")[0];
        };

        const getExpenseAmount = (exp: any) => {
            const currentDivision = String(activeDivision || "ALL").toUpperCase().trim();
            if (currentDivision === "ALL") {
                return Number(exp.total_amount || exp.amount || 0);
            }

            const allocations = getAllocations(exp);
            if (allocations.length > 0) {
                const match = allocations.find(
                    (alloc: any) => String(alloc.division).toUpperCase().trim() === currentDivision
                );
                if (match) {
                    return Number(match.amount !== undefined ? match.amount : (Number(exp.total_amount || exp.amount || 0) * (match.percentage / 100)));
                }
            }

            const expenseDivision = String(exp.division || "").toUpperCase().trim();
            if (expenseDivision === currentDivision) {
                return Number(exp.total_amount || exp.amount || 0);
            }

            return 0;
        };

        // Add Invoices
        filteredInvoices.forEach((inv: any) => {

            const invoiceStatus =
                String(inv.status || "").toLowerCase();

            if (
                invoiceStatus !== "cancelled" &&
                invoiceStatus !== "draft"
            ) {

                entries.push({
                    id: inv.id,

                    date: formatDate(
                        inv.invoice_date ||
                        inv.date ||
                        inv.created_at
                    ),

                    type: "Income",

                    description:
                        `Invoice for ${inv.client_name ||
                        inv.client ||
                        "Client"
                        }`,

                    reference:
                        inv.invoice_number ||
                        inv.invoiceNo,

                    amountIn: Number(
                        inv.total_amount ||
                        inv.total ||
                        inv.amount ||
                        0
                    ),

                    amountOut: 0,

                    balance: 0,

                    status: inv.status
                });
            }
        });

        // Add Expenses
        filteredExpenses.forEach((exp: any) => {
            const approvalStatus = (exp.approval_status || exp.approvalStatus || "").toLowerCase();
            if (approvalStatus === "approved" || !approvalStatus) {
                entries.push({
                    id: exp.id,
                    date: formatDate(exp.date || exp.created_at),
                    type: "Expense",
                    description: exp.description || exp.expenseName || exp.category,
                    reference: exp.reference_id || exp.id,
                    amountIn: 0,
                    amountOut: getExpenseAmount(exp),
                    balance: 0,
                    status: "Paid"
                });
            }
        });

        // Sort by date
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate running balance
        let currentBalance = 0;
        const processed = entries.map(entry => {
            currentBalance += (entry.amountIn - entry.amountOut);
            return { ...entry, balance: currentBalance };
        });

        // Add pending items AT THE END (top after reverse) without affecting balance
        filteredInvoices.forEach((inv: any) => {
            const approvalStatus = (inv.approval_status || inv.approvalStatus || "").toLowerCase();
            if (approvalStatus === "pending" || approvalStatus === "pending_approval") {
                processed.push({
                    id: inv.id,
                    date: formatDate(inv.invoice_date || inv.date || inv.created_at),
                    type: "Income",
                    description: `[PENDING] Invoice for ${inv.client_name || inv.client || 'Client'}`,
                    reference: inv.invoice_number || inv.invoiceNo,
                    amountIn: Number(inv.total_amount || inv.total || inv.amount || 0),
                    amountOut: 0,
                    balance: currentBalance, // Stays same
                    status: "Awaiting Approval"
                });
            }
        });

        filteredExpenses.forEach((exp: any) => {
            const approvalStatus = (exp.approval_status || exp.approvalStatus || "").toLowerCase();
            if (approvalStatus === "pending" || approvalStatus === "pending_approval") {
                processed.push({
                    id: exp.id,
                    date: formatDate(exp.date || exp.created_at),
                    type: "Expense",
                    description: `[PENDING] ${exp.description || exp.expenseName || exp.category}`,
                    reference: exp.reference_id || exp.id,
                    amountIn: 0,
                    amountOut: getExpenseAmount(exp),
                    balance: currentBalance, // Stays same
                    status: "Awaiting Approval"
                });
            }
        });

        return processed.reverse(); // Latest first
    }, [filteredInvoices, filteredExpenses, activeDivision]);

    const finalLedger = useMemo(() => {
        return ledgerData.filter(e => {
            const matchesSearch = (e.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.reference || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "All" 
                ? true 
                : String(e.type).toLowerCase() === String(typeFilter).toLowerCase();
            return matchesSearch && matchesType;
        });
    }, [ledgerData, searchTerm, typeFilter]);

    const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

    if (invLoading || expLoading) {
        return <PageLoader message="Loading Ledger Data..." />;
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader showBack
                title={activeDivision === "all" ? "General Ledger" : `${currentDivision?.label} Ledger`}
                subtitle="Chronological transaction history and running balance"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => setTypeFilter(typeFilter === 'Income' ? 'All' : 'Income')}
                    className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all ${typeFilter === 'Income' ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-white border border-slate-100 hover:border-emerald-200'
                        }`}
                >
                    <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${typeFilter === 'Income' ? 'text-emerald-700' : 'text-slate-500'}`}>Total Inflow</p>
                    <p className="text-3xl font-bold text-emerald-600">QAR {ledgerData.reduce((s, e) => s + e.amountIn, 0).toLocaleString()}</p>
                </div>
                <div
                    onClick={() => setTypeFilter(typeFilter === 'Expense' ? 'All' : 'Expense')}
                    className={`p-6 rounded-lg shadow-sm cursor-pointer transition-all ${typeFilter === 'Expense' ? 'bg-rose-50 border-2 border-rose-500' : 'bg-white border border-slate-100 hover:border-rose-200'
                        }`}
                >
                    <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${typeFilter === 'Expense' ? 'text-rose-700' : 'text-slate-500'}`}>Total Outflow</p>
                    <p className="text-3xl font-bold text-rose-600">QAR {ledgerData.reduce((s, e) => s + e.amountOut, 0).toLocaleString()}</p>
                </div>
                <div
                    onClick={() => setTypeFilter('All')}
                    className={`p-6 rounded-lg shadow-lg text-white cursor-pointer transition-all ${typeFilter === 'All' ? 'bg-brand-900 ring-2 ring-brand-500 ring-offset-2' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                >
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Net Balance</p>
                    <p className="text-3xl font-bold text-emerald-400">QAR {(ledgerData.reduce((s, e) => s + e.amountIn, 0) - ledgerData.reduce((s, e) => s + e.amountOut, 0)).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search description or reference..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Ref #</th>
                                <th className="px-6 py-4 font-semibold text-right">In (+)</th>
                                <th className="px-6 py-4 font-semibold text-right">Out (-)</th>
                                <th className="px-6 py-4 font-semibold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {finalLedger.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="hover:bg-brand-50/50 transition-colors cursor-pointer group"
                                    onClick={() => navigate(entry.type === 'Income' ? `/invoice-details/${entry.id}` : `/expense-details/${entry.id}`)}
                                >
                                    <td className="px-6 py-4 text-sm text-slate-600 group-hover:text-brand-700 font-medium">{entry.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.type === "Income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                            }`}>
                                            {entry.type === "Income" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800 group-hover:text-brand-900">{entry.description}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono group-hover:text-brand-600">{entry.reference}</td>
                                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-semibold">
                                        {entry.amountIn > 0 ? `QAR ${entry.amountIn.toLocaleString()}` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-rose-600 font-semibold">
                                        {entry.amountOut > 0 ? `QAR ${entry.amountOut.toLocaleString()}` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                                        QAR {entry.balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {finalLedger.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                        No transactions found for the selected division.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
