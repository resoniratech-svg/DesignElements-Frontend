import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";

function CreateAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Asset"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save to local storage for persistence visibility
    const localAccounts = JSON.parse(localStorage.getItem("trek_accounts") || "[]");
    localStorage.setItem("trek_accounts", JSON.stringify([form, ...localAccounts]));
    
    setTimeout(() => {
      alert("Account saved successfully!");
      setIsSubmitting(false);
      navigate(-1);
    }, 500);
  };

  return (
    <>
      <PageHeader showBack title="Create Account" />

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
        <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Account Code</label>
            <input 
              required
              type="text" 
              placeholder="1001"
              value={form.code}
              onChange={(e) => setForm({...form, code: e.target.value})}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Account Name</label>
            <input 
              required
              type="text" 
              placeholder="Cash"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Account Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Equity">Equity</option>
            </select>
          </div>

        </div>

        <div className="mt-6 flex items-center gap-3">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Account"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

export default CreateAccount;