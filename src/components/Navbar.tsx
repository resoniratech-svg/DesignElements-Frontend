import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DivisionSwitcher from "./DivisionSwitcher";
import GlobalSearch from "./GlobalSearch";


interface NavbarProps {
  onToggleSidebar?: () => void;
}

function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCreateClientPage = location.pathname === "/create-client";
  const isCreateInvoicePage = location.pathname.startsWith("/create-invoice") || location.pathname.startsWith("/edit-invoice");
  const isCreateQuotationPage = location.pathname.startsWith("/create-quotation") || location.pathname.startsWith("/edit-quotation");
  const isBOQPage = location.pathname.includes("boq");
  const isCreditControlPage = location.pathname === "/credit-control";
  const isPaymentsPage = location.pathname === "/payments";
  const isExpensesPage = location.pathname.startsWith("/expenses") || location.pathname.startsWith("/expense-details");
  const isCreditRequestPage = location.pathname.startsWith("/credit-request");
  const isLedgerPage = location.pathname === "/ledger";
  const isInventoryPage = location.pathname.startsWith("/inventory") || 
                         location.pathname.startsWith("/products") || 
                         location.pathname.startsWith("/inventory-movements") ||
                         location.pathname.startsWith("/create-product") ||
                         location.pathname.startsWith("/create-stock-movement");
  const isEmployeePage = location.pathname.startsWith("/employees");
  const isFinancialReportPage = location.pathname.startsWith("/financial-reports") || 
                                location.pathname.startsWith("/profit-loss") || 
                                location.pathname.startsWith("/balance-sheet");
  const isPROServicesPage = location.pathname.includes("pro-services") || location.pathname.includes("pro-tracking");
  const isMarketingPage = location.pathname.startsWith("/marketing");
  const isUserManagementPage = location.pathname.startsWith("/users") || 
                               location.pathname.startsWith("/create-user") || 
                               location.pathname.startsWith("/edit-user") || 
                               location.pathname.startsWith("/permissions");
  const isClientsPage = location.pathname.startsWith("/clients") || location.pathname.startsWith("/client-details");
  const isDocumentsPage = location.pathname.includes("documents");
  const isSupportPage = location.pathname.includes("support");
  const isSettingsPage = location.pathname.includes("settings");
  const isDashboardPage = location.pathname === "/dashboard" || location.pathname === "/admin/dashboard";

  const isProjectsModule = location.pathname.startsWith("/projects") ||
                           location.pathname.startsWith("/create-project") ||
                           location.pathname.startsWith("/edit-project") ||
                           location.pathname.startsWith("/jobs") ||
                           location.pathname.startsWith("/create-job") ||
                           location.pathname.startsWith("/job-details") ||
                           location.pathname.startsWith("/job-documents");

  const isQuotationsModule = location.pathname.startsWith("/quotations") ||
                             location.pathname.startsWith("/create-quotation") ||
                             location.pathname.startsWith("/edit-quotation") ||
                             location.pathname.startsWith("/quotation-details");

  const isInvoicesModule = location.pathname.startsWith("/invoices") ||
                           location.pathname.startsWith("/create-invoice") ||
                           location.pathname.startsWith("/edit-invoice") ||
                           location.pathname.startsWith("/invoice-details") ||
                           location.pathname.startsWith("/edit-delivery-note") ||
                           location.pathname.startsWith("/delivery-note");

  const hideExtraItems = isCreateClientPage || isCreateInvoicePage || isCreateQuotationPage;
  const hideSearch = hideExtraItems || isBOQPage ||
                     isDashboardPage ||
                     isProjectsModule ||
                     isQuotationsModule ||
                     isInvoicesModule ||
                     isCreditControlPage || 
                     isPaymentsPage || 
                     isExpensesPage || 
                     isCreditRequestPage || 
                     isLedgerPage || 
                     isInventoryPage ||
                     isEmployeePage ||
                     isFinancialReportPage ||
                     isPROServicesPage ||
                     isMarketingPage ||
                     isUserManagementPage ||
                     isClientsPage ||
                     isDocumentsPage ||
                     isSupportPage ||
                     isSettingsPage;



  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="print:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left Section: Mobile Menu & Search Bar (Search hidden on Create Client) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {!hideSearch && <GlobalSearch />}
      </div>

      {/* Middle Section: Division Switcher (Hidden on Create Client) */}
      <div className="hidden lg:block mx-4">
        {!hideExtraItems && (user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTS') && <DivisionSwitcher />}
      </div>

      {/* ─── Right Section ─────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800 leading-tight">
                {user?.name || "Guest"}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight font-medium">
                {user?.role?.replace(/_/g, " ") || ""}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-md border border-white/20 rounded-xl shadow-xl animate-slide-down z-50">
              <div className="p-4 border-b border-gray-100/50">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;