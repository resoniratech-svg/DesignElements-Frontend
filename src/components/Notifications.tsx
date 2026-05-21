import { Bell, Clock, AlertCircle, CheckCircle2, XCircle, Receipt, CreditCard, Folder, ShieldCheck, FileText } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApprovals } from "../context/ApprovalContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useClientPortal";
import { useNotificationStore } from "../modules/marketing/store/notificationStore";
import { notificationService } from "../modules/marketing/services/notificationService";
import api from "../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type { Invoice, Expense } from "../types/finance";
import type { Project, Job } from "../types/project";
import type { Employee } from "../types/employee";
import type { Client } from "../types/client";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

interface NotificationItem {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  time: string;
  rawTime: string;
  route: string;
}

interface ProNotificationData {
  id: string;
  message: string;
  type: string;
  createdAt: string;
}

/**
 * ROLE-BASED NOTIFICATION RULES:
 * ─────────────────────────────────────────
 * SUPER_ADMIN      → Everything
 * ACCOUNTS         → Financial notifications only (invoices, expenses, approvals)
 * PROJECT_MANAGER  → Tasks & project updates only
 * CLIENT           → Only their own invoices & updates + PRO notifications
 */

function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { approvals } = useApprovals();
  const { user } = useAuth();
  const queryResult = useNotifications();
  const proNotifications = useMemo(() => {
    const rawData = queryResult.data?.data || queryResult.data;
    return Array.isArray(rawData) ? rawData : [];
  }, [queryResult.data]);
  const { notifications: marketingNotifications, setNotifications, markAsRead: markMarketingAsRead } = useNotificationStore();

  useEffect(() => {
    const fetchMarketingNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch marketing notifications", error);
      }
    };
    fetchMarketingNotifications();
  }, [setNotifications]);

  const [dbNotifications, setDbNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchDbNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (data?.data) {
           setDbNotifications(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch DB notifications", err);
      }
    };

    fetchDbNotifications(); // Initial fetch
    
    // Add polling to update notifications in real-time every 30 seconds
    const interval = setInterval(fetchDbNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const notifications = useMemo(() => {
    if (!user) return [];
    const role = user.role;
    const list: NotificationItem[] = [];

    // PRO SPECIFIC NOTIFICATIONS (For Clients)
    if (role === "CLIENT" && Array.isArray(proNotifications)) {
      (proNotifications as ProNotificationData[]).forEach((pn) => {
        list.push({
          id: pn.id,
          message: pn.message,
          type: pn.type === "Expiry" ? "error" : (pn.type === "Approval" ? "warning" : "info"),
          time: dayjs(pn.createdAt).fromNow(),
          rawTime: pn.createdAt,
          route: pn.type === "Approval" ? "/client-portal/services" : "/client-portal/dashboard"
        });
      });
    }

    // ═══════════════════════════════════════════
    // SUPER_ADMIN → Everything
    // ═══════════════════════════════════════════
    if (role === "SUPER_ADMIN") {
      // PRO Notifications
      if (Array.isArray(proNotifications)) {
        (proNotifications as ProNotificationData[]).forEach((pn) => {
          list.push({
            id: pn.id,
            message: `PRO: ${pn.message}`,
            type: pn.type === "Expiry" ? "error" : (pn.type === "Approval" ? "warning" : "info"),
            time: dayjs(pn.createdAt).fromNow(),
            rawTime: pn.createdAt,
            route: "/admin/clients"
          });
        });
      }

      approvals.forEach(app => {
        if (app.status === "pending") {
          list.push({
            id: `pending-${app.id}`,
            message: `⏳ Pending ${app.type}: ${app.itemNumber} from ${app.requestedByName}`,
            type: "info",
            time: dayjs(app.requestedAt).fromNow(),
            rawTime: app.requestedAt,
            route: "/admin/approvals"
          });
        } else if (app.status === "approved") {
          list.push({
            id: `approved-${app.id}`,
            message: `✅ Approved: ${app.type} ${app.itemNumber}`,
            type: "success",
            time: dayjs(app.reviewedAt || app.requestedAt).fromNow(),
            rawTime: app.reviewedAt || app.requestedAt,
            route: "/admin/approvals"
          });
        } else if (app.status === "rejected") {
          list.push({
            id: `rejected-${app.id}`,
            message: `❌ Rejected: ${app.type} ${app.itemNumber}${app.notes ? ` — "${app.notes}"` : ""}`,
            type: "error",
            time: dayjs(app.reviewedAt || app.requestedAt).fromNow(),
            rawTime: app.reviewedAt || app.requestedAt,
            route: "/admin/approvals"
          });
        }
      });

      getInvoiceAlerts(list, "/credit-control");
      getExpenseAlerts(list, "/expenses");
      getProjectAlerts(list, "/projects");
      getEmployeeExpiryAlerts(list);
      getClientDocumentExpiryAlerts(list);
    }

    // ═══════════════════════════════════════════
    // ACCOUNTS → Financial notifications ONLY
    // ═══════════════════════════════════════════
    if (role === "ACCOUNTS") {
      approvals.forEach(app => {
        if (!["invoice", "expense"].includes(app.type)) return;
        const ts = app.reviewedAt || app.requestedAt;
        const route = app.type === "expense" ? "/expenses" : "/credit-control";

        if (app.status === "approved") {
          list.push({
            id: `approved-${app.id}`,
            message: `✅ Approved ${app.type}: ${app.itemNumber}`,
            type: "success",
            time: dayjs(ts).fromNow(),
            rawTime: ts,
            route
          });
        } else if (app.status === "rejected") {
          list.push({
            id: `rejected-${app.id}`,
            message: `❌ Rejected ${app.type}: ${app.itemNumber}${app.notes ? ` — "${app.notes}"` : ""}`,
            type: "error",
            time: dayjs(ts).fromNow(),
            rawTime: ts,
            route
          });
        } else if (app.status === "pending") {
          list.push({
            id: `pending-${app.id}`,
            message: `⏳ Pending ${app.type}: ${app.itemNumber}`,
            type: "info",
            time: dayjs(app.requestedAt).fromNow(),
            rawTime: app.requestedAt,
            route
          });
        }
      });

      getInvoiceAlerts(list, "/credit-control");
      getExpenseAlerts(list, "/expenses");
    }

    // ═══════════════════════════════════════════
    // HR / SUPER_ADMIN → Employee document expiries
    // ═══════════════════════════════════════════
    if (role === "HR" || role === "SUPER_ADMIN") {
      getEmployeeExpiryAlerts(list);
    }

    // ═══════════════════════════════════════════
    // PROJECT_MANAGER → Tasks & project updates ONLY
    // ═══════════════════════════════════════════
    if (role === "PROJECT_MANAGER") {
      getProjectAlerts(list, "/projects");
      getJobAlerts(list);
    }

    // ═══════════════════════════════════════════
    // CLIENT → Only own invoices & updates
    // ═══════════════════════════════════════════
    if (role === "CLIENT") {
      approvals.forEach(app => {
        if (app.requestedBy !== user.id) return;
        const ts = app.reviewedAt || app.requestedAt;

        if (app.status === "approved") {
          list.push({
            id: `approved-${app.id}`,
            message: `✅ Your ${app.type} ${app.itemNumber} has been approved`,
            type: "success",
            time: dayjs(ts).fromNow(),
            rawTime: ts,
            route: "/client/billing"
          });
        } else if (app.status === "rejected") {
          list.push({
            id: `rejected-${app.id}`,
            message: `❌ Your ${app.type} ${app.itemNumber} was rejected${app.notes ? `: "${app.notes}"` : ""}`,
            type: "error",
            time: dayjs(ts).fromNow(),
            rawTime: ts,
            route: "/client/billing"
          });
        }
      });

      try {
        try {
          const invoices: Invoice[] = JSON.parse(localStorage.getItem("trek_invoices") || "[]");
          const threeDaysFromNow = dayjs().add(3, "day");

          invoices.forEach((inv) => {
            if ((inv.client || "").toLowerCase() !== (user.name || "").toLowerCase()) return;
            const balance = Number(inv.totals?.balance) || 0;
            if (balance <= 0) return;
            const dueDate = dayjs(inv.dueDate);
            if (!dueDate.isValid()) return;

            if (dueDate.isBefore(dayjs(), "day")) {
              list.push({
                id: `ovd-${inv.invoiceNo}`,
                message: `⚠️ OVERDUE: Invoice ${inv.invoiceNo} — QAR ${balance.toLocaleString()}`,
                type: "error",
                time: dueDate.fromNow(),
                rawTime: inv.dueDate,
                route: "/client/billing"
              });
            } else if (dueDate.isSameOrBefore(threeDaysFromNow, "day")) {
              list.push({
                id: `due-${inv.invoiceNo}`,
                message: `🔔 Payment Due Soon: Invoice ${inv.invoiceNo} on ${inv.dueDate}`,
                type: "warning",
                time: dueDate.fromNow(),
                rawTime: inv.dueDate,
                route: "/client/billing"
              });
            }
          });
        } catch { /* ignore */ }
      } catch { /* ignore */ }
    }

    // MARKETING NOTIFICATIONS (For Admins and PMs)
    if (role === "SUPER_ADMIN" || role === "PROJECT_MANAGER") {
      marketingNotifications.forEach(mn => {
        list.push({
          id: `mkt-${mn.id}`,
          message: `📢 Marketing: ${mn.title} — ${mn.message}`,
          type: mn.type === "reminder" ? "warning" : "info",
          time: dayjs(mn.timestamp || new Date()).fromNow(),
          rawTime: mn.timestamp || new Date().toISOString(),
          route: mn.leadId ? `/marketing/leads/${mn.leadId}` : "/marketing/dashboard"
        });
      });
    }

    // GENERAL DB NOTIFICATIONS (For all users, such as Credit Requests for Clients)
    dbNotifications.forEach(dbn => {
      list.push({
        id: `db-${dbn.id}`,
        message: `${dbn.title}: ${dbn.message}`,
        type: (dbn.type?.toLowerCase() === "info" ? "info" : (dbn.type?.toLowerCase() === "warning" ? "warning" : "info")) as any,
        time: dayjs(dbn.created_at).fromNow(),
        rawTime: dbn.created_at,
        route: "/client/dashboard" // Default route for client notifications
      });
    });

    return list.sort((a, b) => dayjs(b.rawTime).unix() - dayjs(a.rawTime).unix());
  }, [approvals, user, proNotifications, marketingNotifications, dbNotifications]);

  function getInvoiceAlerts(list: NotificationItem[], route: string) {
    try {
      const invoices: Invoice[] = JSON.parse(localStorage.getItem("trek_invoices") || "[]");
      const threeDaysFromNow = dayjs().add(3, "day");
      invoices.forEach((inv) => {
        const balance = Number(inv.totals?.balance) || 0;
        if (balance <= 0) return;
        const dueDate = dayjs(inv.dueDate);
        if (!dueDate.isValid()) return;

        if (dueDate.isBefore(dayjs(), "day")) {
          list.push({
            id: `ovd-${inv.invoiceNo}`,
            message: `⚠️ OVERDUE: Invoice ${inv.invoiceNo} — QAR ${balance.toLocaleString()} (${inv.client})`,
            type: "error",
            time: dueDate.fromNow(),
            rawTime: inv.dueDate,
            route
          });
        } else if (dueDate.isSameOrBefore(threeDaysFromNow, "day")) {
          list.push({
            id: `due-${inv.invoiceNo}`,
            message: `🔔 DUE SOON: Invoice ${inv.invoiceNo} due ${inv.dueDate} (${inv.client})`,
            type: "warning",
            time: dueDate.fromNow(),
            rawTime: inv.dueDate,
            route
          });
        }
      });
    } catch { /* ignore */ }
  }

  function getExpenseAlerts(list: NotificationItem[], route: string) {
    try {
      const expenses: Expense[] = JSON.parse(localStorage.getItem("trek_expenses") || "[]");
      expenses.slice(0, 3).forEach((exp) => {
        list.push({
          id: `exp-${exp.id}`,
          message: `💰 Expense: ${exp.expenseName || exp.id} — QAR ${(Number(exp.amount) || 0).toLocaleString()}`,
          type: "info",
          time: dayjs(exp.createdAt).fromNow(),
          rawTime: exp.createdAt || new Date().toISOString(),
          route
        });
      });
    } catch { /* ignore */ }
  }

  function getProjectAlerts(list: NotificationItem[], route: string) {
    try {
      const projects: Project[] = JSON.parse(localStorage.getItem("trek_projects") || "[]");
      projects.slice(0, 3).forEach((proj) => {
        list.push({
          id: `proj-${proj.id}`,
          message: `📋 Project: ${proj.name || proj.projectName || proj.id}${proj.status ? ` — ${proj.status}` : ""}`,
          type: "info",
          time: dayjs(proj.createdAt || proj.startDate).fromNow(),
          rawTime: proj.createdAt || proj.startDate || new Date().toISOString(),
          route
        });
      });
    } catch { /* ignore */ }
  }

  function getJobAlerts(list: NotificationItem[]) {
    try {
      const jobs: Job[] = JSON.parse(localStorage.getItem("trek_jobs") || "[]");
      jobs.slice(0, 3).forEach((job) => {
        list.push({
          id: `job-${job.id}`,
          message: `🔧 Job: ${job.title || job.name || job.id}${job.status ? ` — ${job.status}` : ""}`,
          type: "info",
          time: dayjs(job.createdAt || job.startDate).fromNow(),
          rawTime: job.createdAt || job.startDate || new Date().toISOString(),
          route: "/jobs"
        });
      });
    } catch { /* ignore */ }
  }

  function getEmployeeExpiryAlerts(list: NotificationItem[]) {
    try {
      const employees: Employee[] = JSON.parse(localStorage.getItem("trek_employees") || "[]");
      const thirtyDaysLater = dayjs().add(30, "day");

      employees.forEach((emp) => {
        const docs = [
          { name: "Passport", expiry: emp.passportExpiry },
          { name: "QID", expiry: emp.qidExpiry },
          { name: "Visa", expiry: emp.visaExpiry }
        ];

        docs.forEach(doc => {
          if (!doc.expiry) return;
          const expiryDate = dayjs(doc.expiry);
          if (!expiryDate.isValid()) return;

          if (expiryDate.isBefore(dayjs(), "day")) {
            list.push({
              id: `emp-exp-${emp.id}-${doc.name}`,
              message: `🚨 EXPIRED: ${emp.name}'s ${doc.name} was due ${doc.expiry}`,
              type: "error",
              time: expiryDate.fromNow(),
              rawTime: doc.expiry,
              route: `/employee-details/${emp.id}`
            });
          } else if (expiryDate.isSameOrBefore(thirtyDaysLater, "day")) {
            list.push({
              id: `emp-due-${emp.id}-${doc.name}`,
              message: `🛡️ EXPIRY SOON: ${emp.name}'s ${doc.name} expires ${doc.expiry}`,
              type: "warning",
              time: expiryDate.fromNow(),
              rawTime: doc.expiry,
              route: `/employee-details/${emp.id}`
            });
          }
        });
      });
    } catch { /* ignore */ }
  }

  function getClientDocumentExpiryAlerts(list: NotificationItem[]) {
    try {
      const clients: Client[] = JSON.parse(localStorage.getItem("trek_clients") || "[]");
      const thirtyDaysLater = dayjs().add(30, "day");

      clients.forEach((client) => {
        const licenses = (client as any).licenses || []; // licenses not in Client base interface
        (licenses as any[]).forEach((lic) => {
          if (!lic.expiryDate) return;
          const expiryDate = dayjs(lic.expiryDate);
          if (!expiryDate.isValid()) return;

          if (expiryDate.isBefore(dayjs(), "day")) {
            list.push({
              id: `cli-exp-${client.id}-${lic.type}`,
              message: `🚨 EXPIRED: ${client.name}'s ${lic.type} was due ${lic.expiryDate}`,
              type: "error",
              time: expiryDate.fromNow(),
              rawTime: lic.expiryDate,
              route: `/client-details/${client.id}`
            });
          } else if (expiryDate.isSameOrBefore(thirtyDaysLater, "day")) {
            list.push({
              id: `cli-due-${client.id}-${lic.type}`,
              message: `📜 EXPIRY SOON: ${client.name}'s ${lic.type} expires ${lic.expiryDate}`,
              type: "warning",
              time: expiryDate.fromNow(),
              rawTime: lic.expiryDate,
              route: `/client-details/${client.id}`
            });
          }
        });
      });
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (note: NotificationItem) => {
    setOpen(false);
    if (note.id.startsWith("mkt-")) {
      const originalId = note.id.replace("mkt-", "");
      markMarketingAsRead(originalId);
      notificationService.markAsRead(originalId);
    } else if (note.id.startsWith("db-")) {
       const originalId = note.id.replace("db-", "");
       api.patch(`/notifications/${originalId}/read`).catch(() => {});
    }
    setTimeout(() => {
      navigate(note.route);
    }, 50);
  };

  const getIcon = (note: NotificationItem) => {
    if (note.type === "success") return <CheckCircle2 size={16} />;
    if (note.type === "error") return <XCircle size={16} />;
    if (note.id.startsWith("exp-")) return <Receipt size={16} />;
    if (note.id.startsWith("ovd-") || note.id.startsWith("due-")) return <CreditCard size={16} />;
    if (note.id.startsWith("proj-")) return <Folder size={16} />;
    if (note.id.startsWith("emp-")) return <ShieldCheck size={16} />;
    if (note.id.startsWith("cli-")) return <FileText size={16} />;
    if (note.type === "warning") return <AlertCircle size={16} />;
    return <CheckCircle2 size={16} />;
  };

  const getIconStyle = (note: NotificationItem) => {
    if (note.type === "success") return "bg-emerald-50 text-emerald-500";
    if (note.type === "error") return "bg-red-50 text-red-500";
    if (note.type === "warning") return "bg-amber-50 text-amber-500";
    return "bg-blue-50 text-blue-500";
  };

  const viewAllRoute = useMemo(() => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "SUPER_ADMIN": return "/admin/approvals";
      case "ACCOUNTS": return "/credit-control";
      case "PROJECT_MANAGER": return "/projects";
      case "CLIENT": return "/client-portal/dashboard";
      default: return "/dashboard";
    }
  }, [user]);

  const viewAllLabel = useMemo(() => {
    if (!user) return "View all →";
    switch (user.role) {
      case "SUPER_ADMIN": return "View all approvals →";
      case "ACCOUNTS": return "View credit control →";
      case "PROJECT_MANAGER": return "View projects →";
      case "CLIENT": return "View my dashboard →";
      default: return "View all →";
    }
  }, [user]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-gray-500" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-lg shadow-2xl z-50">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-[10px] text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-full uppercase">
                {notifications.length} new
              </span>
            )}
          </div>

          <ul className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length > 0 ? notifications.map((note) => (
              <li
                key={note.id}
                onClick={() => handleClick(note)}
                className="px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-xl ${getIconStyle(note)} flex items-center justify-center`}>
                      {getIcon(note)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700 leading-snug">{note.message}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                      <Clock size={10} /> {note.time}
                    </p>
                  </div>
                </div>
              </li>
            )) : (
              <li className="px-5 py-12 text-center">
                <Bell size={28} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-medium italic">No notifications yet</p>
              </li>
            )}
          </ul>

          <div className="px-5 py-3 border-t border-slate-100">
            <button
              onClick={() => { setOpen(false); navigate(viewAllRoute); }}
              className="text-xs text-brand-600 font-bold hover:text-brand-700 transition-colors"
            >
              {viewAllLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;