import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import type { ApprovalStatus } from '../types/approvals';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PendingItem {
  id: number;
  type: 'INVOICE' | 'QUOTATION' | 'EXPENSE';
  number: string;
  total_amount: number;
  division_id: number;
  status: string;
  created_at: string;
}

export const useApprovals = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  const fetchPending = useCallback(async (status: string = 'PENDING', division?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/approvals/pending`, {
        params: { status, division },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPendingItems(res.data.data);
      }
    } catch (err) {
      console.error('Fetch Pending Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const processDecision = async (entityType: string, entityId: number, status: ApprovalStatus, comments?: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await axios.post(`${API_BASE}/approvals/process`, {
        entityType,
        entityId,
        status,
        comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        await fetchPending();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Decision failed' };
    }
  };

  return {
    loading,
    pendingItems,
    fetchPending,
    processDecision
  };
};
