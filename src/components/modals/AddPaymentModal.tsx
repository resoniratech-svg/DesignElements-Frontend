import { useState } from "react";
import FormInput from "../forms/FormInput";
import FormSelect from "../forms/FormSelect";
import FormTextarea from "../forms/FormTextarea";
import { X, CreditCard, Info, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import { useCreditControl } from "../../hooks/useCreditControl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onSuccess: () => void;
}

export default function AddPaymentModal({ isOpen, onClose, invoice, onSuccess }: Props) {
  const { addPayment } = useCreditControl();
  const [formData, setFormData] = useState({
    amount: "",
    method: "Bank Transfer",
    paymentDate: dayjs().format("YYYY-MM-DD"),
    notes: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const pendingAmount = Number(invoice.balance_amount || invoice.balance) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(formData.amount);

    if (amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum > pendingAmount + 0.01) {
      setError(`Amount cannot exceed pending balance (QAR ${pendingAmount.toLocaleString()})`);
      return;
    }

    setLoading(true);
    const result = await addPayment({
      invoiceId: invoice.id,
      amount: amountNum,
      method: formData.method,
      notes: formData.notes
    });

    if (result.success) {
      if (result.data?.flagged) {
        alert("Payment recorded, but the client has exceeded their credit limit. This invoice has been flagged for approval.");
      }
      onSuccess();
      onClose();
    } else {
      setError(result.message || "Failed to record payment");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Record Payment</h2>
              <p className="text-[10px] text-slate-500">Recording for {invoice.invoice_number || invoice.invoiceNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Pending Balance</p>
              <p className="text-xl font-black text-blue-900">QAR {pendingAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <FormInput 
                label="Amount Paid (QAR)"
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({...formData, amount: e.target.value});
                  setError("");
                }}
                required
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FormInput 
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormSelect 
              label="Payment Method"
              value={formData.method}
              onChange={(e) => setFormData({...formData, method: e.target.value})}
              options={[
                "Bank Transfer",
                "Cash",
                "Cheque",
                "Online Gateway",
              ]}
            />
          </div>

          <FormTextarea 
            label="Notes / Reference"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="E.g. Bank Ref #12345"
            rows={2}
          />

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-xs animate-shake">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-brand-100 active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

