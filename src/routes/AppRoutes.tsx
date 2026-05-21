import { Routes, Route } from "react-router-dom";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Auth / Public pages
import Landing from "../pages/common/Landing";
import Login from "../pages/auth/Login";
import Unauthorized from "../pages/common/Unauthorized";

// Route guard
import ProtectedRoute from "./ProtectedRoute";

// Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import Settings from "../pages/admin/Settings";
import AccountsDashboard from "../pages/accounts/AccountsDashboard";
import PMDashboard from "../pages/pm/PMDashboard";
import Users from "../pages/admin/Users";
import CreateUser from "../pages/admin/CreateUser";

import Permissions from "../pages/admin/Permissions";
import EditUser from "../pages/admin/EditUser";

import Projects from "../pages/pm/Projects";
import CreateProject from "../pages/pm/CreateProject";
import EditProject from "../pages/pm/EditProject";
import Jobs from "../pages/pm/Jobs";
import CreateJob from "../pages/pm/CreateJob";
import JobDetails from "../pages/pm/JobDetails";
import JobDocuments from "../pages/pm/JobDocuments";

import Clients from "../pages/admin/Clients";
import CreateClient from "../pages/admin/CreateClient";
import ClientDetails from "../pages/admin/ClientDetails";
import EditClient from "../pages/admin/EditClient";
import AdminPROTracking from "../pages/admin/AdminPROTracking";

import BOQ from "../pages/pm/BOQ";
import CreateBOQ from "../pages/pm/CreateBOQ";
import BOQDetails from "../pages/pm/BOQDetails";


import Proposals from "../pages/admin/Proposals";
import CreateProposal from "../pages/admin/CreateProposal";
import ProposalDetails from "../pages/admin/ProposalDetails";

import Quotations from "../pages/pm/Quotations";
import CreateQuotation from "../pages/pm/CreateQuotation";
import QuotationDetails from "../pages/pm/QuotationDetails";

import Invoices from "../pages/pm/Invoices";
import CreateInvoice from "../pages/pm/CreateInvoice";
import InvoiceDetails from "../pages/accounts/InvoiceDetails";
import EditDeliveryNote from "../pages/pm/EditDeliveryNote";
import DeliveryNoteDetails from "../pages/accounts/DeliveryNoteDetails";
import Payments from "../pages/accounts/Payments";
import Expenses from "../pages/accounts/Expenses";
import CreateExpense from "../pages/accounts/CreateExpense";
import ExpenseDetails from "../pages/accounts/ExpenseDetails";

import ProfitLoss from "../pages/accounts/ProfitLoss";
import BalanceSheet from "../pages/accounts/BalanceSheet";
import FinancialReports from "../pages/accounts/FinancialReports";
import Receipts from "../pages/accounts/Receipts";
import CreditRequest from "../pages/accounts/CreditRequest";
import CreditRequests from "../pages/accounts/CreditRequests";
import Ledger from '../pages/accounts/Ledger';
import CreditControl from "../pages/accounts/CreditControl";

// Client portal imports removed

// Removed unused inventory imports

// Employee Management
import EmployeeDashboard from "../pages/employees/EmployeeDashboard";
// Removed unused employee imports
import AddEditEmployee from "../pages/employees/AddEditEmployee";
import EmployeeDetail from "../pages/employees/EmployeeDetail";
import MyProfile from "../pages/common/MyProfile";

// Marketing
import MarketingDashboard from "../modules/marketing/pages/Dashboard";
import LeadsList from "../modules/marketing/pages/LeadsList";
import LeadDetails from "../modules/marketing/pages/LeadDetails";
import AddEditLead from "../modules/marketing/pages/AddEditLead";

import { useAuth } from "../context/AuthContext";
import { ROLE_DASHBOARD_MAP } from "../types/user";
import { Navigate } from "react-router-dom";

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DASHBOARD_MAP[user.role]} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public Routes ─────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* ─── Protected Routes with Dashboard Layout ─── */}
      <Route element={<DashboardLayout />}>
        {/* Dashboards (Role-based Base) */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ACCOUNTS"]} />}>
          <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["PROJECT_MANAGER"]} />}>
          <Route path="/pm/dashboard" element={<PMDashboard />} />
        </Route>

        {/* Dynamic Sections Base on sidebarMenu permissions */}

        {/* User Management — SUPER_ADMIN only (RBAC enforced) */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} requiredSections={["User Management"]} />}>
          <Route path="/users" element={<Users />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />

          <Route path="/permissions" element={<Permissions />} />
        </Route>

        {/* Projects */}
        <Route element={<ProtectedRoute requiredSections={["Projects"]} />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/edit-project/:id" element={<EditProject />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/job-details" element={<JobDetails />} />
        </Route>

        {/* Estimations & Sales (Consolidated) */}
        <Route element={<ProtectedRoute requiredSections={["Estimations"]} />}>
          <Route path="/boq" element={<BOQ />} />
          <Route path="/create-boq" element={<CreateBOQ />} />
          <Route path="/edit-boq/:id" element={<CreateBOQ />} />

          <Route path="/quotations" element={<Quotations />} />
          <Route path="/create-quotation" element={<CreateQuotation />} />
          <Route path="/edit-quotation/:id" element={<CreateQuotation />} />

          <Route path="/proposals" element={<Proposals />} />
          <Route path="/create-proposal" element={<CreateProposal />} />
          <Route path="/edit-proposal/:id" element={<CreateProposal />} />
          <Route path="/draft-proposals" element={<Proposals filter="Draft" />} />
          <Route path="/proposal-templates" element={<Proposals filter="Templates" />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/create-invoice/:division" element={<CreateInvoice />} />
          <Route path="/edit-invoice/:id" element={<CreateInvoice />} />
          <Route path="/edit-delivery-note/:id" element={<EditDeliveryNote />} />
        </Route>

        {/* Clients */}
        <Route element={<ProtectedRoute requiredSections={["Client Management"]} />}>
          <Route path="/clients" element={<Clients />} />
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/create-client" element={<CreateClient />} />
          </Route>
          <Route path="/client-details/:id" element={<ClientDetails />} />
          <Route path="/edit-client/:id" element={<EditClient />} />
          <Route path="/admin/pro-tracking" element={<AdminPROTracking />} />
        </Route>

        <Route element={<ProtectedRoute requiredSections={["Accounting"]} />}>
          <Route path="/credit-control" element={<CreditControl />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/create-expense" element={<CreateExpense />} />
          <Route path="/edit-expense/:id" element={<CreateExpense />} />
          <Route path="/expense-details/:id" element={<ExpenseDetails />} />

          <Route path="/receipts" element={<Receipts />} />
          <Route path="/credit-requests" element={<CreditRequests />} />
          <Route path="/credit-request" element={<CreditRequest />} />
          <Route path="/edit-credit-request/:id" element={<CreditRequest />} />
          <Route path="/ledger" element={<Ledger />} />
        </Route>

        {/* Reports */}
        <Route element={<ProtectedRoute requiredSections={["Reports"]} />}>
          <Route path="/financial-reports" element={<FinancialReports />} />
          <Route path="/profit-loss" element={<ProfitLoss />} />
          <Route path="/balance-sheet" element={<BalanceSheet />} />
        </Route>



        {/* Employee Management */}
        <Route element={<ProtectedRoute requiredSections={["Employee Management"]} />}>
          <Route path="/employees" element={<EmployeeDashboard />} />
          <Route path="/employees/create" element={<AddEditEmployee />} />
          <Route path="/employees/edit/:id" element={<AddEditEmployee />} />
          <Route path="/employees/details/:id" element={<EmployeeDetail />} />
          <Route path="/pro-services" element={<AdminPROTracking />} />
        </Route>

        {/* Marketing & Lead Management */}
        <Route element={<ProtectedRoute requiredSections={["Marketing"]} />}>
          <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
          <Route path="/marketing/leads" element={<LeadsList />} />
          <Route path="/marketing/leads/new" element={<AddEditLead />} />
          <Route path="/marketing/leads/edit/:id" element={<AddEditLead />} />
          <Route path="/marketing/leads/:id" element={<LeadDetails />} />
        </Route>

        {/* Shared items available to basically anyone authenticated correctly */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS"]} />}>
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/job-documents" element={<JobDocuments />} />
          <Route path="/proposal-details/:id" element={<ProposalDetails />} />
          <Route path="/quotation-details/:id" element={<QuotationDetails />} />
          <Route path="/invoice-details/:id" element={<InvoiceDetails />} />
          <Route path="/delivery-note/:id" element={<DeliveryNoteDetails />} />
          <Route path="/boq-details/:id" element={<BOQDetails />} />
        </Route>
        {/* Redirects for decommissioned pages */}
        <Route path="/employees/list" element={<Navigate to="/pro-services" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;