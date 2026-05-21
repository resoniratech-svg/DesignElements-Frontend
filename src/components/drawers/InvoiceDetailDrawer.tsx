
import { X, Receipt, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onAddPayment?: () => void;
}

export default function InvoiceDetailDrawer({ isOpen, onClose, invoice }: Props) {
  if (!invoice) return null;

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), 'day') && invoice.status !== "PAID";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[70]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{invoice.invoice_number || invoice.invoiceNo}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        invoice.status === "PAID" ? "bg-emerald-100 text-emerald-600" :
                        invoice.status === "PARTIAL" ? "bg-amber-100 text-amber-600" :
                        "bg-slate-200 text-slate-600"
                    }`}>
                      {invoice.status || "Unpaid"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Issued: {dayjs(invoice.created_at || invoice.date).format('YYYY-MM-DD')}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                  <p className="text-lg font-black text-slate-900 mt-1">QAR {(invoice.total_amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Collected</p>
                  <p className="text-lg font-black text-emerald-700 mt-1">QAR {(invoice.amount_paid || 0).toLocaleString()}</p>
                </div>
                <div className="col-span-2 p-5 rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-100 relative overflow-hidden">
                  <div className="relative z-10 text-center">
                    <p className="text-[11px] font-bold text-brand-100 uppercase tracking-widest">Remaining Balance</p>
                    <p className="text-3xl font-black mt-1 tracking-tighter">QAR {(invoice.balance_amount || 0).toLocaleString()}</p>
                    {isOverdue && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-md">
                            <Clock size={12} /> Overdue
                        </div>
                    )}
                  </div>
                  <Receipt size={100} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />
                </div>
              </div>

              {/* Client Info */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Client Information
                </h3>
                <div className="p-4 rounded-lg border border-slate-100 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Client Name</span>
                        <span className="text-xs font-bold text-slate-800">{invoice.client_name || invoice.client}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Customer ID</span>
                        <span className="text-xs font-bold text-slate-800">{invoice.client_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-50 pt-2 mt-2">
                        <span className="text-xs text-slate-500">Sector / Division</span>
                        <span className="text-xs font-bold text-slate-800 uppercase">{invoice.division || 'N/A'}</span>
                    </div>
                </div>
              </section>

              {/* Items Breakdown */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Items Breakdown</h3>
                <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoice.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800">{item.description}</p>
                                        <p className="text-[10px] text-slate-500">{item.quantity} x QAR {item.unitPrice}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">QAR {item.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
