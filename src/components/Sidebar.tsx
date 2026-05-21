import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedSidebarSections, PERMISSIONS_CHANGED_EVENT } from "../utils/permissions";
import { X, ChevronRight } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role;

  // Force re-render when permissions change
  const [, setPermVersion] = useState(0);
  useEffect(() => {
    const handler = () => setPermVersion(v => v + 1);
    window.addEventListener(PERMISSIONS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PERMISSIONS_CHANGED_EVENT, handler);
  }, []);

  return (
    <aside className="print:hidden w-[260px] h-screen bg-sidebar flex flex-col border-r border-sidebar-border relative">
      {/* ─── Mobile Close Button ───────────────────────── */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
      {/* ─── Brand Header ──────────────────────────────── */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Design Elements Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">
              Design Elements
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              ERP System
            </p>
          </div>
        </div>
      </div>

      {/* ─── Role Badge ────────────────────────────────── */}
      {userRole && (
        <div className="px-5 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-600/10 border border-brand-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-brand-300 tracking-wide">
              {userRole.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {/* ─── Navigation Menu ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {getAuthorizedSidebarSections(userRole).map((section, i) => (
          <div key={i}>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-semibold mb-2 px-3">
              {section.section}
            </p>

            <div className="space-y-0.5">
              {section.items
                .filter(item => !item.roles || (userRole && item.roles.includes(userRole)))
                .map((item, index) => {
                  const Icon = item.icon;
                  const active = item.path === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-2 text-[13px] rounded-lg transition-all duration-200
                        ${active
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 font-medium"
                          : "text-slate-400 hover:bg-sidebar-hover hover:text-slate-200"
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.2 : 1.7}
                        className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <ChevronRight size={14} className="text-white/60" />
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Footer ────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-slate-600 text-center">
          © 2026 Design Elements
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;