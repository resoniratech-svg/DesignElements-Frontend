import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  status: string;
  created_at: string;
  division: string;
  due_date?: string; // Added
  invoice_date?: string; // Added
}

export interface CreditSummary {
  totalInvoiced: number;
  totalCollected: number;
  pendingPayments: number;
  dueAmount?: number;
  overdueCount: number;
}

export const useCreditControl = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);

  const fetchSummary = useCallback(async (filters: any = {}) => {
    if (!token) return;
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "all"));
      const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
      const res = await axios.get(`${API_BASE}/v1/credit-control/summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Fetch Summary Error:', err);
    }
  }, [token]);

  const fetchInvoices = useCallback(async (filters: any = {}) => {
    if (!token) return;
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "all"));
      const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
      const res = await axios.get(`${API_BASE}/v1/credit-control/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setInvoices(res.data.data.invoices);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error('Fetch Invoices Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addPayment = async (paymentData: { invoiceId: number; amount: number; method: string; notes?: string }) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await axios.post(`${API_BASE}/v1/credit-control/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        await fetchSummary();
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Payment failed' };
    }
  };

  return {
    loading,
    summary,
    invoices,
    total,
    fetchSummary,
    fetchInvoices,
    addPayment
  };
};
