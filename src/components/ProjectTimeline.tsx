
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Milestone {
  label: string;
  date?: string;
  status: "completed" | "active" | "pending";
}

interface Props {
  milestones: Milestone[];
}

export default function ProjectTimeline({ milestones }: Props) {
  return (
    <div className="space-y-2 py-4">
      {milestones.map((milestone, idx) => (
        <div key={idx} className="relative flex gap-4 min-h-[50px]">
          {/* Vertical Line */}
          {idx !== milestones.length - 1 && (
            <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${
              milestone.status === "completed" ? "bg-emerald-500" : "bg-slate-100"
            }`} />
          )}

          {/* Icon/Circle */}
          <div className="relative z-10 flex-shrink-0 mt-1">
            {milestone.status === "completed" ? (
              <CheckCircle2 size={24} className="text-emerald-500 bg-white" />
            ) : milestone.status === "active" ? (
              <div className="w-6 h-6 rounded-full border-4 border-blue-500 bg-white flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
            ) : (
              <Circle size={24} className="text-slate-200 bg-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between">
               <p className={`text-xs font-bold tracking-tight ${
                 milestone.status === "completed" ? "text-slate-900" : 
                 milestone.status === "active" ? "text-blue-600" : "text-slate-400"
               }`}>
                 {milestone.label}
               </p>
               {milestone.date && (
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{milestone.date}</span>
               )}
            </div>
            {milestone.status === "active" && (
              <p className="text-[10px] text-blue-500/80 mt-1 italic flex items-center gap-1">
                <Clock size={10} /> Currently in progress
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
