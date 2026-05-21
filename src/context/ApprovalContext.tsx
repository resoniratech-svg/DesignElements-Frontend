import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { ApprovalRecord, ApprovalStatus, ApprovalType } from "../types/approvals";
import { useAuth } from "./AuthContext";
import { useActivity } from "./ActivityContext";

interface ApprovalContextType {
  approvals: ApprovalRecord[];
  requestApproval: (params: Omit<ApprovalRecord, "id" | "status" | "requestedBy" | "requestedByName" | "requestedAt">) => string;
  approveItem: (id: string, notes?: string) => void;
  rejectItem: (id: string, notes?: string) => void;
  getApprovalStatus: (itemId: string, type: ApprovalType) => ApprovalStatus | undefined;
  getPendingCount: () => number;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export function ApprovalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(() => {
    const stored = localStorage.getItem("trek_approvals");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("trek_approvals", JSON.stringify(approvals));
  }, [approvals]);

  // Real-time synchronization across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "trek_approvals" && e.newValue) {
        setApprovals(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const requestApproval = useCallback((params: Omit<ApprovalRecord, "id" | "status" | "requestedBy" | "requestedByName" | "requestedAt">) => {
    const id = `APP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord: ApprovalRecord = {
      ...params,
      id,
      status: "pending",
      requestedBy: user?.id || "unknown",
      requestedByName: user?.name || "Unknown User",
      requestedAt: new Date().toISOString(),
    };

    setApprovals(prev => [newRecord, ...prev]);
    return id;
  }, [user]);

  const updateItemInStorage = useCallback((type: ApprovalType, itemId: string, status: ApprovalStatus) => {
    const storageKey = type === "invoice" ? "trek_invoices" : 
                      type === "quotation" ? "trek_quotations" : 
                      type === "expense" ? "trek_expenses" : "trek_credit_requests";
    
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const items = JSON.parse(stored);
      const updatedItems = items.map((item: any) => {
        // Handle different ID formats (id vs invoiceNo vs Quote ID)
        const isMatch = item.id === itemId || 
                       (type === "invoice" && item.invoiceNo === itemId) ||
                       (type === "quotation" && item["Quote ID"] === itemId);
        
        if (isMatch) {
          return { ...item, approvalStatus: status };
        }
        return item;
      });
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.error(`Error updating ${type} in storage:`, error);
    }
  }, []);

  const { logActivity } = useActivity();

  const approveItem = useCallback((id: string, notes?: string) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === id) {
        // Update the actual item in storage as well
        updateItemInStorage(app.type, app.itemId, "approved");

        logActivity(`Approved ${app.type}: ${app.itemNumber}`, "role", "/admin/approvals", app.itemNumber);

        return {
          ...app,
          status: "approved",
          reviewedBy: user?.id,
          reviewedByName: user?.name,
          reviewedAt: new Date().toISOString(),
          notes: notes || app.notes
        };
      }
      return app;
    }));
  }, [user, updateItemInStorage, logActivity]);

  const rejectItem = useCallback((id: string, notes?: string) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === id) {
        // Update the actual item in storage as well
        updateItemInStorage(app.type, app.itemId, "rejected");

        logActivity(`Rejected ${app.type}: ${app.itemNumber}`, "role", "/admin/approvals", app.itemNumber);

        return {
          ...app,
          status: "rejected",
          reviewedBy: user?.id,
          reviewedByName: user?.name,
          reviewedAt: new Date().toISOString(),
          notes: notes || app.notes
        };
      }
      return app;
    }));
  }, [user, updateItemInStorage, logActivity]);

  const getApprovalStatus = useCallback((itemId: string, type: ApprovalType) => {
    const record = approvals.find(a => a.itemId === itemId && a.type === type);
    return record?.status;
  }, [approvals]);

  const getPendingCount = useCallback(() => {
    return approvals.filter(a => a.status === "pending").length;
  }, [approvals]);

  return (
    <ApprovalContext.Provider value={{ 
      approvals, 
      requestApproval, 
      approveItem, 
      rejectItem, 
      getApprovalStatus,
      getPendingCount
    }}>
      {children}
    </ApprovalContext.Provider>
  );
}

export function useApprovals() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error("useApprovals must be used within an ApprovalProvider");
  }
  return context;
}
