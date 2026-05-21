
import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Download, Upload, ShieldCheck, Database, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";

const Settings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { logActivity } = useActivity();

  const handleExport = () => {
    setIsExporting(true);
    setMessage(null);
    
    setTimeout(() => {
      try {
        const allData: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("trek_") || key === "activities")) {
            const value = localStorage.getItem(key);
            try {
              allData[key] = JSON.parse(value || "null");
            } catch {
              allData[key] = value;
            }
          }
        }

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TrekGroup_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logActivity("Generated System Backup", "system", "/settings");
        setMessage({ type: 'success', text: "Backup generated and downloaded successfully." });
      } catch (err) {
        setMessage({ type: 'error', text: "Failed to generate backup." });
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (confirm("Warning: This will overwrite all current system data. Are you sure you want to proceed?")) {
          // Clear current trek data
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("trek_") || key === "activities")) {
              localStorage.removeItem(key);
            }
          }

          // Restore from backup
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          });

          logActivity("Restored System from Backup", "system", "/settings");
          setMessage({ type: 'success', text: "System data restored successfully. Please refresh the page." });
          
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (err) {
        setMessage({ type: 'error', text: "Invalid backup file." });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        subtitle="Manage platform configuration and data integrity"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Management Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-50 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-lg shadow-brand-100">
                <Database size={24} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Data Management</h3>
                <p className="text-xs text-slate-500 font-medium">Backup and restore system records</p>
             </div>
          </div>

          <div className="p-6 space-y-6">
             <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                   <p className="text-sm font-bold text-amber-900 leading-tight">Data Safety Warning</p>
                   <p className="text-xs text-amber-700 mt-1 font-medium italic">
                      Always perform a backup before importing old data. All current unsaved changes will be lost during restoration.
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
                >
                   {isExporting ? <Loader2 size={24} className="text-brand-600 animate-spin mb-3" /> : <Download size={24} className="text-slate-400 group-hover:text-brand-600 mb-3 transition-colors" />}
                   <span className="text-sm font-black text-slate-700">Download Backup</span>
                   <span className="text-[10px] text-slate-400 uppercase font-black mt-1">Full System JSON</span>
                </button>

                <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                   {isImporting ? <RefreshCw size={24} className="text-emerald-600 animate-spin mb-3" /> : <Upload size={24} className="text-slate-400 group-hover:text-emerald-600 mb-3 transition-colors" />}
                   <span className="text-sm font-black text-slate-700">Restore Data</span>
                   <span className="text-[10px] text-slate-400 uppercase font-black mt-1">Upload .json file</span>
                   <input type="file" className="hidden" accept=".json" onChange={handleImport} disabled={isImporting} />
                </label>
             </div>

             {message && (
               <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
                 message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
               }`}>
                 {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                 <p className="text-sm font-bold tracking-tight">{message.text}</p>
               </div>
             )}
          </div>
        </div>

        {/* Security & Audit Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-50 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Security & Integrity</h3>
                <p className="text-xs text-slate-500 font-medium">Platform compliance and audit tracking</p>
             </div>
          </div>

          <div className="p-6 space-y-5">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                   <p className="text-sm font-bold text-slate-700 leading-tight">Session Auto-lock</p>
                   <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 uppercase tracking-wider">Requires Re-authentication after 4h</p>
                </div>
                <div className="w-10 h-5 bg-emerald-400 rounded-full relative shadow-inner">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-50 cursor-not-allowed">
                <div>
                   <p className="text-sm font-bold text-slate-700 leading-tight">2-Factor Auth (2FA)</p>
                   <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">DISABLED BY ADMINISTRATOR</p>
                </div>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative">
                   <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
             </div>

             <div className="pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">System Version: v2.5.0-Stable</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
