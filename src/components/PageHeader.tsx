import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  action?: ReactNode;
  showBack?: boolean;
}

function PageHeader({ title, subtitle, buttonText, buttonLink, action, showBack }: Props) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 flex-shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {action && <div>{action}</div>}

        {buttonText && buttonLink && (
          <Link to={buttonLink} className="w-full sm:w-auto">
            <button className="btn-primary w-full sm:w-auto text-sm py-2 px-3 sm:px-4">
              <Plus size={16} />
              {buttonText}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default PageHeader;