
import React from "react";
import { User, Activity, AlertCircle, ExternalLink } from "lucide-react";
import { formatTimeAgo } from "../utils/dateUtils";
import { useActivity } from "../context/ActivityContext";
import { Link } from "react-router-dom";

interface ActivityLogProps {
  maxItems?: number;
  divisionFilter?: string;
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ maxItems = 10, divisionFilter, className = "" }) => {
  const { activities } = useActivity();

  const filteredLogs = React.useMemo(() => {
    let result = activities;
    if (divisionFilter && divisionFilter !== "all") {
      // Assuming we might add division to Activity later, 
      // for now we just show all if no match found
      // result = result.filter(l => l.category === divisionFilter); 
    }
    return result.slice(0, maxItems);
  }, [activities, maxItems, divisionFilter]);

  if (filteredLogs.length === 0) {
    return (
      <div className={`p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 ${className}`}>
        <Activity size={32} className="mx-auto text-slate-300 mb-2 opacity-50" />
        <p className="text-sm text-slate-400 font-medium tracking-tight">No activities recorded yet.</p>
        <p className="text-[10px] text-slate-300 uppercase mt-1 tracking-widest font-bold">Audit Trail System Active</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {filteredLogs.map((log) => (
        <div key={log.id} className="group relative flex items-start gap-3 p-3 hover:bg-brand-50/30 rounded-xl transition-all duration-300 border border-transparent hover:border-brand-100/50">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
             <User size={14} className="text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
               <p className="text-sm font-bold text-slate-800 leading-tight">
                 {log.action}
                 {log.subject && <span className="text-brand-600 ml-1.5">"{log.subject}"</span>}
               </p>
               <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">
                  {formatTimeAgo(log.time)}
               </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
               <div className="flex items-center gap-1.5">
                  <User size={10} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">{log.performingUser}</span>
               </div>
               <span className="text-slate-300 text-[10px]">•</span>
               <span className="text-[9px] font-black text-brand-500/60 uppercase tracking-tighter">
                  {log.performingUserRole?.replace(/_/g, " ")}
               </span>
            </div>
            {log.path && (
               <Link 
                 to={log.path} 
                 className="inline-flex items-center gap-1 mt-2 text-[10px] font-black text-brand-600 hover:underline hover:text-brand-700 transition-all opacity-0 group-hover:opacity-100"
               >
                 View Record <ExternalLink size={8} />
               </Link>
            )}
          </div>
        </div>
      ))}
      
      <div className="pt-2">
         <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <AlertCircle size={12} className="text-emerald-600" />
            <p className="text-[10px] font-bold text-emerald-800 tracking-tight uppercase tracking-wider">System Audit Trail Active & Encrypted</p>
         </div>
      </div>
    </div>
  );
};

export default ActivityLog;
