import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  path?: string;
  onClick?: () => void;
  className?: string;
}

function StatCard({ title, value, icon, trend, path, onClick, className = "" }: Props) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) onClick();
    if (path) navigate(path);
  };

  return (
    <div 
      onClick={handleClick}
      className={`card-hover p-5 group ${ (path || onClick) ? 'cursor-pointer active:scale-[0.98] transition-all' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight break-words">
            {value}
          </p>
          {trend && (
            <p
              className={`text-[11px] sm:text-xs font-medium flex items-center gap-1 mt-1 ${
                trend.positive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span className="truncate">{trend.value}</span>
            </p>
          )}
        </div>

        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors duration-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;