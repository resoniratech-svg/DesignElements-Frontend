import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
// Removed unused User import
import type { Client } from "../types/client";
type InventoryProduct = any;
type InventoryMovement = any;
type PurchaseOrder = any;
type SalesOrder = any;
import type { Invoice, Expense } from "../types/finance";
import type { Project, Job } from "../types/project";
import type { Lead } from "../types/marketing";
import type { Employee } from "../types/employee";

/**
 * MOCK API INTERCEPTOR
 * This interceptor catches all requests to /api/* and processes them locally
 * using localStorage to simulate a real backend.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getLocalStorage = <T>(key: string): T[] => {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        return [];
    }
};
const setLocalStorage = <T>(key: string, data: T) => localStorage.setItem(key, JSON.stringify(data));

interface TypedResponse<T = any> {
    config: InternalAxiosRequestConfig;
    response: {
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
        config: InternalAxiosRequestConfig;
    };
}

const respond = <T>(config: InternalAxiosRequestConfig, data: T, status = 200, statusText = "OK"): Promise<never> => {
    return Promise.reject({
        config,
        response: {
            data,
            status,
            statusText,
            headers: {},
            config
        }
    } as TypedResponse<T>);
};

export const attachMockInterceptor = (instance: AxiosInstance) => {
    instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        const { url, method, data, params } = config;
        
        // Simulate network latency
        await sleep(400);

        /* 
        // Mock Login Disabled to support real PostgreSQL authentication
        if (url === "/auth/login" && method === "post") {
          ...
        }
        */

        /*
        // --- CLIENTS ---
        if (url === "/clients" && method === "get") {
            const clients = [
                { id: 1, name: "Qatar Petroleum", client_code: "CL-001", division: "oil_gas", phone: "+974 4444 0000" },
                { id: 2, name: "Lusail Real Estate", client_code: "CL-002", division: "construction", phone: "+974 4444 1111" },
                { id: 3, name: "Hamad Medical Corp", client_code: "CL-003", division: "medical", phone: "+974 4444 2222" },
                { id: 4, name: "Qatar Foundation", client_code: "CL-004", division: "education", phone: "+974 4444 3333" },
                { id: 5, name: "Ashghal", client_code: "CL-005", division: "construction", phone: "+974 4444 4444" },
            ];
            return respond(config, {
                success: true,
                total: clients.length,
                page: 1,
                limit: 50,
                data: clients
            });
        }
        */

        if (url === "/clients" && method === "post") {
            return respond(config, {
                success: true,
                message: "Client created successfully",
                clientCode: `CLI-${Date.now()}`
            }, 201, "Created");
        }

        if (url?.startsWith("/clients/") && method === "delete") {
            const id = url.split("/").pop();
            const clients = getLocalStorage<Client>("design_clients");
            const filtered = clients.filter((c) => c.id !== id);
            setLocalStorage("design_clients", filtered);
            return respond(config, { success: true });
        }

        // --- CLIENT PORTAL ---
        if (url === "/client/dashboard" && method === "get") {
            return respond(config, {
                stats: { activeServices: 3, expiringDocs: 2, pendingActions: 1, totalTasks: 5 },
                notifications: [
                    { id: "1", message: "Trade License expires in 12 days", type: "EXPIRY", isRead: false, createdAt: new Date() },
                    { id: "2", message: "Quotation for Signatory Update sent", type: "SYSTEM", isRead: true, createdAt: new Date() }
                ],
                recentTasks: [
                    { id: "T1", title: "Renew Immigration Card", status: "In Progress", dueDate: "2026-04-15" }
                ]
            });
        }

        if (url === "/client/documents" && method === "get") {
            return respond(config, [
                { id: "D1", name: "Trade License", number: "TL-99221", issueDate: "2024-05-01", expiryDate: "2026-04-10", status: "Expiring Soon", category: "Compliance" },
                { id: "D2", name: "Computer Card", number: "CC-11200", issueDate: "2025-01-01", expiryDate: "2027-01-01", status: "Active", category: "Compliance" },
                { id: "D3", name: "Tax Card", number: "TX-4455", issueDate: "2023-01-01", expiryDate: "2026-03-01", status: "Expired", category: "Finance" }
            ]);
        }

        if (url === "/client/tasks" && method === "get") {
            return respond(config, [
                { id: "T1", title: "Renew Immigration Card", description: "Government fee payment pending", status: "In Progress", priority: "High", dueDate: "2026-04-15" },
                { id: "T2", title: "Update Signature Authorization", description: "Awaiting original QID from client", status: "Pending", priority: "Medium", dueDate: "2026-03-20" },
                { id: "T3", title: "Visa Stamping - 2 Employees", description: "Medical completed", status: "Completed", priority: "Low", dueDate: "2026-02-15" }
            ]);
        }

        if (url === "/client/contracts" && method === "get") {
            return respond(config, [
                { id: "C1", name: "Monthly PRO Support", billingCycle: "Monthly", amount: 2500, startDate: "2025-01-01", nextRenewalDate: "2026-04-01", status: "Active" }
            ]);
        }

        if (url === "/client/profile" && method === "get") {
            return respond(config, {
                companyName: "ABC Trading & Contracting",
                contactPerson: "Ahmed Ali",
                email: "ahmed@abctrading.com",
                phone: "+974 5555 1234",
                address: "Building 45, Lusail Marina, Doha, Qatar"
            });
        }

        if (url === "/notifications" && method === "get") {
             return respond(config, [
                { id: "1", message: "Trade License expires in 12 days", type: "EXPIRY", isRead: false, createdAt: new Date() },
                { id: "2", message: "Quotation for Signatory Update sent", type: "SYSTEM", isRead: true, createdAt: new Date() },
                { id: "3", message: "New tax regulation update for 2026", type: "INFO", isRead: false, createdAt: new Date() }
            ]);
        }

        // --- CLIENT BILLING ---
        if (url === "/client/billing/summary" && method === "get") {
            const invoices = getLocalStorage<Invoice>("design_invoices");
            const invList = Array.isArray(invoices) ? invoices : [];
            const total = invList.reduce((sum: number, inv) => sum + (Number(inv.total || inv.amount || 0)), 0);
            const paid = invList.filter((inv) => inv.status === "Paid").reduce((sum: number, inv) => sum + (Number(inv.total || inv.amount || 0)), 0);
            return respond(config, { total, paid, pending: total - paid });
        }

        if (url === "/client/billing/invoices" && method === "get") {
            const invoices = getLocalStorage<Invoice>("design_invoices");
            const invList = Array.isArray(invoices) ? invoices : [];
            return respond(config, invList.map((inv) => ({
                id: inv.id || inv.invoiceNo,
                number: inv.invoiceNo || (inv as any).number || `INV-${inv.id}`,
                date: inv.date || (inv as any).issueDate,
                dueDate: inv.dueDate,
                amount: Number(inv.total || inv.amount || 0),
                status: inv.status || "Pending"
            })));
        }

        // --- CLIENT PORTAL DATA ---
        if (url === "/client/documents" && method === "get") {
            return respond(config, [
                { id: "doc1", name: "Trade License", number: "TL-2026-991", issueDate: "2025-04-10", expiryDate: "2026-04-10", status: "Active" },
                { id: "doc2", name: "Computer Card", number: "CC-88219-X", issueDate: "2024-11-20", expiryDate: "2025-11-20", status: "Active" },
                { id: "doc3", name: "Tax Card", number: "TX-Q1102", issueDate: "2025-01-01", expiryDate: "2025-12-31", status: "Active" }
            ]);
        }

        if (url === "/client/tasks" && method === "get") {
            return respond(config, [
                { id: "task1", title: "Signatory Update", description: "Submit original QID for PRO processing", status: "In Progress", priority: "High", dueDate: "2026-03-31" },
                { id: "task2", title: "TL Renewal", description: "Annual trade license renewal", status: "Not Started", priority: "Medium", dueDate: "2026-04-05" }
            ]);
        }

        if (url === "/client/contracts" && method === "get") {
            return respond(config, [
                { id: "c1", name: "PRO AMC - Gold", status: "Active", billingCycle: "Monthly", amount: 2500, nextRenewalDate: "2026-04-01" },
                { id: "c2", name: "Labor Law Consultation", status: "Active", billingCycle: "Annual", amount: 12000, nextRenewalDate: "2026-12-31" }
            ]);
        }

        if (url === "/client/profile" && method === "get") {
            return respond(config, {
                companyName: "Design Elements Trading & Contracting",
                contactPerson: "Ahmed Ali",
                email: "contact@designelementsqatar.com",
                phone: "+974 4455 6677",
                address: "Office 402, Al-Reem Tower, West Bay, Doha, Qatar"
            });
        }

        // --- PROJECTS ---
        // --- PRO SERVICES TRACKING (Admin) ---
        if (url === "/pro/contracts/all" && method === "get") {
            return respond(config, [
                { id: "PC-001", clientId: "C-001", type: "Full PRO Retainer", monthlyFee: 5000, expiryDate: "2026-12-31", status: "Active" }
            ]);
        }

        if (url?.startsWith("/pro/tasks") && method === "get") {
            return respond(config, [
                { id: "PT-001", clientId: "C-001", title: "Trade License Renewal", description: "Submit documents to DED", status: "In Progress", priority: "High", dueDate: "2026-04-10" }
            ]);
        }

        if (url === "/pro/documents/all" && method === "get") {
            return respond(config, [
                { id: "D-101", clientId: "C-001", name: "Commercial License", number: "TL-55440", expiryDate: "2026-04-10", status: "Expiring Soon" },
                { id: "D-102", clientId: "C-001", name: "Establishment Card", number: "EC-9988", expiryDate: "2026-12-01", status: "Active" }
            ]);
        }

        /*
        if (url === "/projects" && method === "get") {
            const projects = getLocalStorage<Project>("trek_projects");
            return respond(config, Array.isArray(projects) ? projects : []);
        }

        if (url === "/projects" && method === "post") {
            const projects = getLocalStorage<Project>("trek_projects");
            const newProject = {
                ...data,
                id: `PROJ-${Date.now()}`,
                status: data?.status || "Pending",
                createdAt: new Date().toISOString().split("T")[0]
            } as Project;
            setLocalStorage("trek_projects", [...(Array.isArray(projects) ? projects : []), newProject]);
            return respond(config, newProject, 201, "Created");
        }

        if (url?.match(/^\/projects\/[^/]+$/) && method === "put") {
            const id = url.split("/").pop();
            const projects = getLocalStorage<Project>("trek_projects");
            const updated = (Array.isArray(projects) ? projects : []).map((p) => p.id === id ? { ...p, ...data } : p);
            setLocalStorage("trek_projects", updated);
            return respond(config, { ...data, id });
        }

        if (url?.startsWith("/projects/") && method === "delete") {
            const id = url.split("/").pop();
            const projects = getLocalStorage<Project>("trek_projects");
            const filtered = Array.isArray(projects) ? projects.filter((p) => p.id !== id) : [];
            setLocalStorage("trek_projects", filtered);
            return respond(config, { success: true });
        }
        */

        // --- JOBS ---
        if (url === "/jobs" && method === "get") {
            const jobs = getLocalStorage<Job>("design_jobs");
            return respond(config, Array.isArray(jobs) ? jobs : []);
        }

        // --- INVOICES ---
        /*
        if (url === "/invoices" && method === "get") {
            const invoices = getLocalStorage<Invoice>("trek_invoices");
            return respond(config, Array.isArray(invoices) ? invoices : []);
        }
        */

        // --- EXPENSES ---
        if (url === "/expenses" && method === "get") {
            const expenses = getLocalStorage<Expense>("design_expenses");
            return respond(config, Array.isArray(expenses) ? expenses : []);
        }

        // --- INVENTORY: PRODUCTS ---
        if (url === "/products" && method === "get") {
            const data = getLocalStorage<InventoryProduct>("design_inventory_products");
            return respond(config, Array.isArray(data) ? data : []);
        }
        if (url === "/products" && method === "post") {
            const products = getLocalStorage<InventoryProduct>("design_inventory_products");
            const newProduct = { ...data, id: `PROD-${Date.now()}` } as InventoryProduct;
            setLocalStorage("design_inventory_products", [...(Array.isArray(products) ? products : []), newProduct]);
            return respond(config, newProduct, 201, "Created");
        }
        if (url?.match(/^\/products\/[^/]+$/) && method === "get") {
            const id = url.split("/").pop();
            const products = getLocalStorage<InventoryProduct>("design_inventory_products");
            const found = (Array.isArray(products) ? products : []).find((p) => p.id === id);
            return respond(config, found || null, found ? 200 : 404, found ? "OK" : "Not Found");
        }
        if (url?.match(/^\/products\/[^/]+$/) && method === "put") {
            const id = url.split("/").pop();
            const products = getLocalStorage<InventoryProduct>("design_inventory_products");
            const updated = (Array.isArray(products) ? products : []).map((p) => p.id === id ? { ...p, ...data } : p);
            setLocalStorage("design_inventory_products", updated);
            return respond(config, { ...data, id });
        }
        if (url?.match(/^\/products\/[^/]+\/stock$/) && method === "patch") {
            const id = url.split("/")[2];
            const products = getLocalStorage<InventoryProduct>("design_inventory_products");
            const updated = (Array.isArray(products) ? products : []).map((p) => p.id === id ? { ...p, stockQuantity: (p.stockQuantity || 0) + ((data as any)?.quantity || 0) } : p);
            setLocalStorage("design_inventory_products", updated);
            return respond(config, { success: true });
        }
        if (url?.startsWith("/inventory/products/") && method === "delete") {
            const id = url.split("/").pop();
            const products = getLocalStorage<InventoryProduct>("design_inventory_products");
            const filtered = (Array.isArray(products) ? products : []).filter((p) => p.id !== id);
            setLocalStorage("design_inventory_products", filtered);
            return respond(config, { success: true });
        }

        // --- INVENTORY: PURCHASE ORDERS ---
        if (url === "/purchase-orders" && method === "get") {
            const data = getLocalStorage<PurchaseOrder>("design_purchase_orders");
            return respond(config, Array.isArray(data) ? data : []);
        }
        if (url === "/purchase-orders" && method === "post") {
            const orders = getLocalStorage<PurchaseOrder>("design_purchase_orders");
            const newOrder = { ...data, id: `PO-${Date.now()}`, status: "Pending" } as PurchaseOrder;
            setLocalStorage("design_purchase_orders", [...(Array.isArray(orders) ? orders : []), newOrder]);
            return respond(config, newOrder, 201, "Created");
        }
        if (url?.match(/^\/purchase-orders\/[^/]+$/) && method === "delete") {
            const id = url.split("/").pop();
            const orders = getLocalStorage<PurchaseOrder>("design_purchase_orders");
            const filtered = (Array.isArray(orders) ? orders : []).filter((o) => o.id !== id);
            setLocalStorage("design_purchase_orders", filtered);
            return respond(config, { success: true });
        }

        // --- INVENTORY: MOVEMENTS ---
        if (url === "/inventory/movements" && method === "get") {
            const data = getLocalStorage<InventoryMovement>("design_inventory_movements");
            return respond(config, Array.isArray(data) ? data : []);
        }

        // --- INVENTORY: SALES ORDERS ---
        if (url === "/inventory/sales-orders" && method === "get") {
            const data = getLocalStorage<SalesOrder>("design_inventory_sales");
            return respond(config, Array.isArray(data) ? data : []);
        }
        if (url === "/inventory/sales-orders" && method === "post") {
            const orders = getLocalStorage<SalesOrder>("design_inventory_sales");
            const newOrder = { ...data, id: `SO-${Date.now()}`, status: "Processing" } as SalesOrder;
            setLocalStorage("design_inventory_sales", [...(Array.isArray(orders) ? orders : []), newOrder]);
            return respond(config, newOrder, 201, "Created");
        }

        // --- INVENTORY: PROFIT STATS ---
        if (url === "/inventory/profit-stats" && method === "get") {
            const data = localStorage.getItem("design_inventory_profit");
            const stats = data ? JSON.parse(data) : { totalRevenue: 0, totalCosts: 0, totalProfit: 0, profitMargin: 0 };
            return respond(config, stats);
        }
        // --- EMPLOYEE MANAGEMENT ---
        if (url === "/employees/dashboard-stats" && method === "get") {
            const employees = getLocalStorage<Employee>("design_employees");
            const list = Array.isArray(employees) ? employees : [];
            const now = new Date();
            const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            let expiringDocs = 0, expiredDocs = 0;
            list.forEach((emp) => {
                if (emp.passportExpiry) {
                    const expiry = new Date(emp.passportExpiry);
                    if (expiry < now) expiredDocs++;
                    else if (expiry < thirtyDaysLater) expiringDocs++;
                }
                if (emp.qidExpiry) {
                    const expiry = new Date(emp.qidExpiry);
                    if (expiry < now) expiredDocs++;
                    else if (expiry < thirtyDaysLater) expiringDocs++;
                }
            });
            const activeCount = list.filter((e) => e.status === "Active").length;
            const docAlerts = list.filter((e) => {
                if (!e.passportExpiry && !e.qidExpiry) return false;
                const pExp = e.passportExpiry ? new Date(e.passportExpiry) : null;
                const qExp = e.qidExpiry ? new Date(e.qidExpiry) : null;
                return (pExp && pExp < thirtyDaysLater) || (qExp && qExp < thirtyDaysLater);
            }).map((e) => ({
                employeeId: e.id,
                employeeName: e.name,
                documentType: "Passport / QID",
                expiryDate: e.passportExpiry || e.qidExpiry,
                status: (e.passportExpiry || e.qidExpiry) && new Date((e.passportExpiry || e.qidExpiry)!) < now ? "Expired" : "Expiring Soon"
            }));
            const recentEmployees = [...list]
                .sort((a, b) => new Date(b.joinedDate || b.joinDate || 0).getTime() - new Date(a.joinedDate || a.joinDate || 0).getTime())
                .slice(0, 5)
                .map((e) => ({
                    id: e.id,
                    name: e.name,
                    role: e.role,
                    division: e.division,
                    status: e.status,
                    joinedDate: e.joinedDate || e.joinDate
                }));
            return respond(config, {
                stats: { totalEmployees: list.length, activeEmployees: activeCount, expiringDocs, expiredDocs },
                documentAlerts: docAlerts,
                recentEmployees
            });
        }
        if (url === "/employees" && method === "get") {
            const data = getLocalStorage<Employee>("design_employees");
            return respond(config, Array.isArray(data) ? data : []);
        }
        if (url === "/employees" && method === "post") {
            const employees = getLocalStorage<Employee>("design_employees");
            const newEmp = { ...data, id: data?.id || `EMP-${Date.now()}`, status: data?.status || "Active", joinDate: data?.joinDate || new Date().toISOString().split("T")[0] } as Employee;
            setLocalStorage("design_employees", [...(Array.isArray(employees) ? employees : []), newEmp]);
            return respond(config, newEmp, 201, "Created");
        }
        if (url?.match(/^\/employees\/[^/]+$/) && method === "get") {
            const id = url.split("/").pop();
            const employees = getLocalStorage<Employee>("design_employees");
            const found = (Array.isArray(employees) ? employees : []).find((e) => e.id === id);
            return respond(config, found || null, found ? 200 : 404, found ? "OK" : "Not Found");
        }
        if (url?.match(/^\/employees\/[^/]+$/) && method === "put") {
            const id = url.split("/").pop();
            const employees = getLocalStorage<Employee>("design_employees");
            const updated = (Array.isArray(employees) ? employees : []).map((e) => e.id === id ? { ...e, ...data } : e);
            setLocalStorage("design_employees", updated);
            return respond(config, { ...data, id });
        }
        if (url?.match(/^\/employees\/[^/]+$/) && method === "delete") {
            const id = url.split("/").pop();
            const employees = getLocalStorage<Employee>("design_employees");
            const filtered = (Array.isArray(employees) ? employees : []).filter((e) => e.id !== id);
            setLocalStorage("design_employees", filtered);
            return respond(config, { success: true });
        }

        // --- ADMIN DASHBOARD STATS ---
        if (url === "/admin/dashboard-stats" && method === "get") {
            const invoices = getLocalStorage<Invoice>("design_invoices");
            const expenses = getLocalStorage<Expense>("design_expenses");
            const projects = getLocalStorage<Project>("design_projects");
            const jobs = getLocalStorage<Job>("design_jobs");
            const leads = getLocalStorage<Lead>("design_leads");
            const employees = getLocalStorage<Employee>("design_employees");

            const rawInvList = Array.isArray(invoices) ? invoices : [];
            const rawExpList = Array.isArray(expenses) ? expenses : [];
            const rawProjList = Array.isArray(projects) ? projects : [];
            const rawJobList = Array.isArray(jobs) ? jobs : [];
            const rawLeadList = Array.isArray(leads) ? leads : [];
            const rawEmpList = Array.isArray(employees) ? employees : [];
            
            const activeDivision = params?.division;
            const matchesDivision = (itemDiv: string | undefined) => {
                if (!activeDivision || activeDivision === "all") return true;
                const normalized = (itemDiv || "contracting").toLowerCase();
                const mappedActive = activeDivision;
                return normalized === activeDivision || normalized === mappedActive;
            };

            const invList = rawInvList.filter(i => matchesDivision(i.branch || i.division));
            const expList = rawExpList.filter(e => matchesDivision(e.referenceType || e.division || e.branch));
            const projList = rawProjList.filter(p => matchesDivision(p.division || p.branch));
            const jobList = rawJobList.filter(j => matchesDivision((j as any).division));
            const leadList = rawLeadList.filter(l => matchesDivision(l.division));
            const empList = rawEmpList.filter(e => matchesDivision(e.division));

            // --- Summary Stats ---
            const totalReceivables = invList
                .filter((i) => i.status !== "Paid" && (i.approvalStatus === "approved" || !i.approvalStatus))
                .reduce((sum: number, i) => sum + Number(i.total || i.amount || 0), 0);
            const totalPayables = expList
                .filter((e) => (e.approvalStatus === "approved" || !e.approvalStatus))
                .reduce((sum: number, e) => sum + Number(e.amount || 0), 0);
            const activeProjectsCount = projList.filter((p) => p.status === "Active" || p.status === "Ongoing" || !p.status || p.status === "Pending").length;
            const totalRevenue = invList
                .filter((i) => i.approvalStatus === "approved" || !i.approvalStatus)
                .reduce((sum: number, i) => sum + Number(i.total || i.amount || 0), 0);

            // --- Division-wise Performance ---
            const divisionKeys = ["trading", "contracting"];
            const divisionLabels: Record<string, string> = { trading: "Trading Sector", contracting: "Contracting Sector" };
            const divisionColors: Record<string, string> = { trading: "#f59e0b", contracting: "#8b5cf6" };
            const divisionPerformance = divisionKeys.map(div => {
                const mapped = div;
                const divRevenue = rawInvList
                    .filter((i) => {
                        const d = (i.branch || i.division || "").toLowerCase();
                        return d === mapped || d === div;
                    })
                    .filter((i) => i.approvalStatus === "approved" || !i.approvalStatus)
                    .reduce((s: number, i) => s + Number(i.total || i.amount || 0), 0);
                const divExpense = rawExpList
                    .filter((e) => {
                        const d = (e.referenceType || e.division || e.branch || "").toLowerCase();
                        return d === mapped || d === div;
                    })
                    .filter((e) => e.approvalStatus === "approved" || !e.approvalStatus)
                    .reduce((s: number, e) => s + Number(e.amount || 0), 0);
                const divProjects = rawProjList.filter((p) => {
                    const d = (p.division || p.branch || "").toLowerCase();
                    return d === mapped || d === div;
                }).length;
                return { division: div, label: divisionLabels[div], color: divisionColors[div], revenue: divRevenue, expense: divExpense, projects: divProjects, profit: divRevenue - divExpense };
            });

            // --- Revenue Trends (Monthly, last 6 months) ---
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const now = new Date();
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6Months.push({ month: months[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear() });
            }
            const revenueTrends = last6Months.map(m => {
                const revenue = invList
                    .filter((inv) => {
                        const invDate = new Date(inv.date || inv.createdAt || "");
                        return invDate.getMonth() === m.monthIndex && invDate.getFullYear() === m.year && (inv.approvalStatus === "approved" || !inv.approvalStatus);
                    })
                    .reduce((sum: number, inv) => sum + Number(inv.total || inv.amount || 0), 0);
                const expense = expList
                    .filter((exp) => {
                        const expDate = new Date(exp.date || exp.createdAt || "");
                        return expDate.getMonth() === m.monthIndex && expDate.getFullYear() === m.year && (exp.approvalStatus === "approved" || !exp.approvalStatus);
                    })
                    .reduce((sum: number, exp) => sum + Number(exp.amount || 0), 0);
                return { month: m.month, revenue, expense, profit: revenue - expense };
            });

            // --- Pending Payments (Top 5 unpaid invoices) ---
            const pendingPayments = invList
                .filter((i) => i.status !== "Paid" && (i.approvalStatus === "approved" || !i.approvalStatus))
                .sort((a, b) => Number(b.total || b.amount || 0) - Number(a.total || a.amount || 0))
                .slice(0, 5)
                .map((i) => ({
                    id: i.id || i.invoiceNo,
                    invoiceNo: i.invoiceNo || i.id,
                    client: i.client || "Unknown",
                    amount: Number(i.total || i.amount || 0),
                    status: i.status || "Pending",
                    dueDate: i.dueDate || i.date || "",
                    division: (i.branch || i.division || "Contracting")
                }));

            // --- Active Projects (Top 5) ---
            const activeProjects = projList
                .filter((p) => p.status === "Active" || p.status === "Ongoing" || !p.status || p.status === "Pending")
                .slice(0, 5)
                .map((p) => ({
                    id: p.id,
                    name: (p as any).projectName || p.name || "Unnamed Project",
                    client: (p as any).client || (p as any).clientName || "N/A",
                    division: p.division || p.branch || "contracting",
                    status: p.status || "Active",
                    startDate: p.startDate || "",
                    deadline: p.deadline || (p as any).endDate || "",
                    jobCount: jobList.filter((j) => (j as any).projectId === p.id || (j as any).project === (p as any).projectName).length
                }));

            // --- Lead Conversion Rate ---
            const totalLeads = leadList.length;
            const convertedLeads = leadList.filter((l) => l.status === "Converted").length;
            const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";
            const leadFunnel = [
                { stage: "New", count: leadList.filter((l) => l.status === "New").length },
                { stage: "Follow-up", count: leadList.filter((l) => l.status === "Follow-up" || l.status === "Contacted").length },
                { stage: "Converted", count: convertedLeads },
                { stage: "Lost", count: leadList.filter((l) => l.status === "Lost" || l.status === "Closed").length }
            ];

            // --- Recent Activity (from invoices/expenses/projects) ---
            const recentInvoices = [...invList]
                .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime())
                .slice(0, 5)
                .map((inv) => ({
                    id: inv.invoiceNo || inv.id,
                    client: inv.client,
                    amount: Number(inv.total || inv.amount || 0),
                    status: inv.status,
                    division: (inv.branch || "Contracting")
                }));

            return respond(config, {
                stats: {
                    totalReceivables,
                    totalPayables,
                    activeProjects: activeProjectsCount,
                    totalRevenue,
                    totalEmployees: empList.length,
                    totalLeads,
                    convertedLeads,
                    conversionRate: Number(conversionRate)
                },
                divisionPerformance,
                revenueTrends,
                pendingPayments,
                activeProjects,
                leadFunnel,
                recentInvoices
            });
        }

        // --- ACCOUNTS DASHBOARD STATS ---
        if (url === "/accounts/dashboard-stats" && method === "get") {
            const invoices = getLocalStorage<Invoice>("design_invoices");
            const expenses = getLocalStorage<Expense>("design_expenses");
            const invList = Array.isArray(invoices) ? invoices : [];
            const expList = Array.isArray(expenses) ? expenses : [];

            const totalInvoices = invList.reduce((sum: number, inv) => sum + Number(inv.total || inv.amount || 0), 0);
            const totalInvoicesPaid = invList
                .filter((inv) => inv.status === "Paid")
                .reduce((sum: number, inv) => sum + Number(inv.total || inv.amount || 0), 0);
            
            const receivables = totalInvoices - totalInvoicesPaid;

            const payables = expList
                .filter((exp) => exp.status !== "Paid" && (exp.approvalStatus === "approved" || !exp.approvalStatus))
                .reduce((sum: number, exp) => sum + Number(exp.amount || 0), 0);

            const pendingPayments = invList
                .filter((inv) => inv.status === "Unpaid" && (inv.approvalStatus === "approved" || !inv.approvalStatus))
                .reduce((sum: number, inv) => sum + Number(inv.total || inv.amount || 0), 0);

            const totalRevenue = invList
                .filter((inv) => inv.approvalStatus === "approved" || !inv.approvalStatus)
                .reduce((sum: number, inv) => sum + Number(inv.total || inv.amount || 0), 0);

            const totalExp = expList
                .filter((exp) => exp.approvalStatus === "approved" || !exp.approvalStatus)
                .reduce((sum: number, exp) => sum + Number(exp.amount || 0), 0);

            const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalExp) / totalRevenue) * 100).toFixed(1) : "0.0";

            const monthsShort = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
            const financialData = monthsShort.map(month => ({
                month,
                receivables: invList
                    .filter((i) => {
                        const date = new Date(i.date || i.createdAt || "");
                        return date.toLocaleString('default', { month: 'short' }) === month;
                    })
                    .reduce((sum: number, i) => sum + Number(i.total || 0), 0),
                payables: expList
                    .filter((e) => {
                        const date = new Date(e.date || e.createdAt || "");
                        return date.toLocaleString('default', { month: 'short' }) === month;
                    })
                    .reduce((sum: number, e) => sum + Number(e.amount || 0), 0)
            }));

            return respond(config, {
                stats: { receivables, payables, pendingPayments, profitMargin },
                financialData,
                recentInvoices: invList.slice(0, 5)
            });
        }

        // --- PM DASHBOARD STATS ---
        if (url === "/pm/dashboard-stats" && method === "get") {
            const projects = getLocalStorage<Project>("design_projects");
            const jobs = getLocalStorage<Job>("design_jobs");
            const projList = Array.isArray(projects) ? projects : [];
            const jobList = Array.isArray(jobs) ? jobs : [];

            const stats = {
                activeProjects: projList.filter((p) => !p.status || p.status === "Pending" || p.status === "In Progress").length,
                ongoingJobs: jobList.filter((j) => !["Completed", "Delivered"].includes(j.status)).length,
                completedJobs: jobList.filter((j) => ["Completed", "Delivered"].includes(j.status)).length,
                overdueTasks: jobList.filter((j) => j.status !== "Completed" && new Date(j.dueDate || "") < new Date()).length
            };

            const projectDistribution = [
                { name: "Active", value: stats.activeProjects },
                { name: "Completed", value: projList.filter((p) => p.status === "Completed").length },
                { name: "On Hold", value: projList.filter((p) => p.status === "On Hold").length }
            ].filter(d => d.value > 0);

            return respond(config, {
                stats,
                projectDistribution,
                recentJobs: jobList.slice(0, 5)
            });
        }

        // --- MARKETING DASHBOARD STATS ---
        if (url === "/marketing/dashboard-stats" && method === "get") {
            const leads = getLocalStorage<Lead>("design_leads");
            const leadList = Array.isArray(leads) ? leads : [];
            const stats = {
                totalLeads: leadList.length,
                followedUpLeads: leadList.filter((l) => l.status === "Follow-up" || l.status === "Contacted").length,
                convertedLeads: leadList.filter((l) => l.status === "Converted").length,
                pendingLeads: leadList.filter((l) => l.status === "New").length,
                monthlyData: [
                    { month: 'Jan', value: 45 },
                    { month: 'Feb', value: 52 },
                    { month: 'Mar', value: leadList.length }
                ],
                funnelData: [
                    { stage: "New", count: leadList.filter((l) => l.status === "New").length },
                    { stage: "Follow-up", count: leadList.filter((l) => l.status === "Follow-up" || l.status === "Contacted").length },
                    { stage: "Converted", count: leadList.filter((l) => l.status === "Converted").length },
                    { stage: "Lost", count: leadList.filter((l) => l.status === "Lost" || l.status === "Closed").length }
                ]
            };
            return respond(config, stats);
        }

        // --- LEADS CRUD ---
        if (url === "/leads" && method === "get") {
            const leads = getLocalStorage<Lead>("design_leads");
            return respond(config, Array.isArray(leads) ? leads : []);
        }

        if (url === "/leads" && method === "post") {
            const leads = getLocalStorage<Lead>("design_leads");
            const newLead = { 
                ...(data as Lead), 
                id: `LEAD-${Date.now()}`, 
                createdAt: new Date().toISOString().split('T')[0],
                status: (data as Lead).status || "New"
            };
            setLocalStorage("design_leads", [...(Array.isArray(leads) ? leads : []), newLead]);
            return respond(config, newLead, 201, "Created");
        }

        if (url?.match(/^\/leads\/[^/]+$/) && method === "get") {
            const id = url.split("/").pop();
            const leads = getLocalStorage<Lead>("design_leads");
            const found = (Array.isArray(leads) ? leads : []).find((l) => l.id === id);
            return respond(config, found || null, found ? 200 : 404, found ? "OK" : "Not Found");
        }

        if (url?.match(/^\/leads\/[^/]+$/) && method === "put") {
            const id = url.split("/").pop();
            const leads = getLocalStorage<Lead>("design_leads");
            const updated = (Array.isArray(leads) ? leads : []).map((l) => l.id === id ? { ...l, ...(data as Lead) } : l);
            setLocalStorage("design_leads", updated);
            return respond(config, { ...(data as Lead), id });
        }

        if (url?.match(/^\/leads\/[^/]+$/) && method === "delete") {
            const id = url.split("/").pop();
            const leads = getLocalStorage<Lead>("design_leads");
            const filtered = (Array.isArray(leads) ? leads : []).filter((l) => l.id !== id);
            setLocalStorage("design_leads", filtered);
            return respond(config, { success: true });
        }

        // --- PAYMENTS ---
        if (url === "/payments" && method === "get") {
            const payments = getLocalStorage<{ id: string, client: string, invoice: string, amount: number, date: string, division: string }>("design_payments");
            // If empty, seed some data
            if (!Array.isArray(payments) || payments.length === 0) {
                const initial = [
                    { id: "PAY-001", client: "ABC Company", invoice: "INV-001", amount: 1200, date: "2026-03-06", division: "contracting" },
                    { id: "PAY-002", client: "Global Tech", invoice: "INV-005", amount: 4500, date: "2026-03-10", division: "trading" },
                    { id: "PAY-003", client: "City Services", invoice: "INV-012", amount: 800, date: "2026-03-12", division: "trading" },
                ];
                setLocalStorage("design_payments", initial);
                return respond(config, initial);
            }
            return respond(config, payments);
        }

        if (url === "/payments" && method === "post") {
            const payments = getLocalStorage<any>("design_payments");
            const newPayment = { ...data, id: `PAY-${Date.now()}` };
            setLocalStorage("design_payments", [...(Array.isArray(payments) ? payments : []), newPayment]);
            return respond(config, newPayment, 201, "Created");
        }

        if (url?.match(/^\/leads\/[^/]+\/status$/) && method === "patch") {
            const id = url.split("/")[2];
            const leads = getLocalStorage<Lead>("design_leads");
            const updated = (Array.isArray(leads) ? leads : []).map((l) => l.id === id ? { ...l, status: (data as any).status } : l);
            setLocalStorage("design_leads", updated);
            return respond(config, { success: true });
        }

        /*
        // Mock Users Disabled to support real PostgreSQL data
        if (url === "/users" && method === "get") {
          ...
        }
        */

        /*
        if (url === "/users" && method === "post") {
          ...
        }
        */

        return config;
    }, (error) => Promise.reject(error));

    // Handle the "rejected" promises that are actually successful mock responses
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status >= 200 && error.response.status < 300) {
                return Promise.resolve(error.response);
            }
            return Promise.reject(error);
        }
    );
};
