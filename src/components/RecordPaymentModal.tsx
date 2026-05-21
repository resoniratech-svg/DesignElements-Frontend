
import React, { useState } from "react";
import { X, DollarSign, Calendar, Briefcase, User, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { DIVISIONS } from "../constants/divisions";
import { financeService } from "../services/financeService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ClientAutocomplete from "./forms/ClientAutocomplete";

import { useActivity } from "../context/ActivityContext";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { logActivity } = useActivity();
  const [formData, setFormData] = useState({
    client: "",
    invoice: "",
    amount: "",
    method: "Bank Transfer",
    date: new Date().toISOString().split('T')[0],
    division: "contracting",
    clientId: ""
  });

  // Fetch invoices for selected client
  const { data: clientInvoices = [] } = useQuery({
    queryKey: ["invoices", "client", formData.clientId],
    queryFn: () => financeService.getInvoicesByClient(formData.clientId),
    enabled: !!formData.clientId
  });

  const outstandingInvoices = clientInvoices.filter((i: any) => {
    const status = (i.status || "").toUpperCase();
    return status !== "PAID";
  });

  const mutation = useMutation({
    mutationFn: financeService.recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      // Log Activity for Audit Trail
      logActivity(
        "Recorded Payment",
        "finance",
        "/payments",
        `${formData.client} - QAR ${parseFloat(formData.amount).toLocaleString()}`
      );

      onClose();
      setFormData({
        client: "",
        invoice: "",
        amount: "",
        method: "Bank Transfer",
        date: new Date().toISOString().split('T')[0],
        division: "contracting",
        clientId: ""
      });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to record payment";
      alert(`Error: ${msg}`);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.amount || !formData.invoice) return;
    
    mutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      invoice_id: formData.invoice,
      invoiceId: formData.invoice,
      method: formData.method
    } as any);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-200">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Record Client Payment</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Finance & Accounting</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Division / Sector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={12} /> Business Sector
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              >
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2"><User size={12} /> Client Name</div>
                {/* <button type="button" className="text-brand-600 hover:text-brand-700 flex items-center gap-1">+ Add</button> */}
              </label>
              <ClientAutocomplete
                value={formData.client}
                onChange={(name, clientId) => {
                  setFormData({ ...formData, client: name, clientId: clientId || "", invoice: "" });
                }}
                division={formData.division}
                placeholder="Search clients..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Invoice Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText size={12} /> Invoice No.
              </label>
              {formData.clientId && outstandingInvoices.length > 0 ? (
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none font-bold text-slate-700"
                  value={formData.invoice}
                  onChange={(e) => {
                    const selInv = outstandingInvoices.find((i: any) => (i.invoiceNo || i.invoice_number) === e.target.value) as any;
                    const bal = selInv ? (selInv.balanceAmount ?? selInv.balance_amount ?? 0) : "";
                    setFormData({ ...formData, invoice: e.target.value, amount: String(bal) });
                  }}
                >
                  <option value="">Select Invoice</option>
                  {outstandingInvoices.map((inv: any) => {
                    const num = inv.invoiceNo || inv.invoice_number;
                    const bal = inv.balanceAmount ?? inv.balance_amount ?? 0;
                    return (
                      <option key={inv.id} value={num}>
                        {num} (Bal: QAR {Number(bal).toLocaleString()})
                      </option>
                    )
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. TRD-INV-001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={formData.invoice}
                  onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                />
              )}
            </div>
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={12} /> Amount (QAR)
              </label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-800"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={12} /> Payment Date
              </label>
              <input
                required
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            {/* Payment Method */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={12} /> Payment Method
              </label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
