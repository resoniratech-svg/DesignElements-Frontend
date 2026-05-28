import api from "./api";
import type { Invoice, Payment } from "../types/finance";

export const financeService = {
  getInvoices: async (divisionId?: string, page: number = 1, limit: number = 10): Promise<{ data: Invoice[], total: number }> => {
    const response = await api.get("/invoices", { params: { division: divisionId, page, limit } });
    const rows = response.data?.data?.data || response.data?.data || response.data || [];
    const total = response.data?.data?.total || (Array.isArray(rows) ? rows.length : 0);
    return {
      data: Array.isArray(rows) ? rows : [],
      total: total
    };
  },

  getInvoicesByClient: async (clientId: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices?clientId=${clientId}`);
    return response.data?.data || response.data || [];
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data?.data || response.data;
  },

  createInvoice: async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.post("/invoices", invoiceData);
    return response.data?.data || response.data;
  },

  updateInvoice: async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id: string, status: Invoice["status"]): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },
  
  getPayments: async (): Promise<any[]> => {
    const response = await api.get("/invoices?limit=100");
    const rawData = response.data?.data?.data || response.data?.data || [];
    return Array.isArray(rawData) ? rawData.map((p: any) => ({
       id: p.invoice_number || p.invoiceNo, // Show invoice No as payment ID
       dbId: p.id, // Database ID for internal reference
       client: p.client_name || p.company_name || p.client || "N/A",
       invoice: p.invoice_number || p.invoiceNo,
       amount: p.total_amount || p.total || p.amount || 0,
       date: p.invoice_date || p.date || p.created_at?.split('T')[0] || '',
       division: p.division || p.branch,
       status: p.status,
       delivery_note: p.delivery_note || p.deliveryNote
    })) : [];
  },

  recordPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await api.post("/payments", paymentData);
    return response.data;
  },

  // Expenses
  getExpenses: async (limit: number = 1000): Promise<any[]> => {
    const response = await api.get("/v1/expenses", { params: { limit } });
    return response.data?.data || response.data || [];
  },

  getExpense: async (id: string): Promise<any> => {
    const response = await api.get(`/v1/expenses/${id}`);
    return response.data?.data || response.data;
  },

  createExpense: async (expenseData: any): Promise<any> => {
    const response = await api.post("/v1/expenses", expenseData);
    return response.data?.data || response.data;
  },

  updateExpense: async (id: string, expenseData: any): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}`, expenseData);
    return response.data?.data || response.data;
  },

  deleteExpense: async (id: string): Promise<any> => {
    const response = await api.delete(`/v1/expenses/${id}`);
    return response.data?.data || response.data;
  },

  approveExpense: async (id: string, allocations: any[] = []): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}/approve`, { allocations });
    return response.data?.data || response.data;
  },

  rejectExpense: async (id: string): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}/reject`);
    return response.data?.data || response.data;
  }
};
