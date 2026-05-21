import api from "./api";
import type { PROTask, PRODocument, PRONotification, PROContract } from "../types/pro";

export const proService = {
  getContracts: async (): Promise<PROContract[]> => {
    const response = await api.get("/pro/contracts/all");
    return response.data;
  },

  getTasks: async (clientId?: string): Promise<PROTask[]> => {
    const response = await api.get("/pro/tasks", { params: { clientId } });
    return response.data;
  },

  getDocuments: async (clientId: string): Promise<PRODocument[]> => {
    const response = await api.get(`/pro/documents/client/${clientId}`);
    return response.data;
  },

  getNotifications: async (clientId?: string): Promise<PRONotification[]> => {
    const response = await api.get("/pro/notifications", { params: { clientId } });
    return response.data;
  },

  runExpiryCheck: async (): Promise<{ success: boolean; checked: number; alerts: number }> => {
    const response = await api.post("/pro/expiry-check");
    return response.data;
  },

  addTask: async (data: Partial<PROTask>): Promise<PROTask> => {
    const response = await api.post("/pro/tasks", data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<PROTask>): Promise<PROTask> => {
    const response = await api.patch(`/pro/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/pro/tasks/${id}`);
    return response.data;
  },

  addNotification: async (data: Partial<PRONotification>): Promise<PRONotification> => {
    const response = await api.post("/pro/notifications", data);
    return response.data;
  },

  uploadDocument: async (clientId: string, docId: string, data: FormData): Promise<PRODocument> => {
    const response = await api.post(`/pro/documents/${clientId}/${docId}`, data);
    return response.data;
  },

  getAllDocuments: async (): Promise<PRODocument[]> => {
    const response = await api.get("/pro/documents/all");
    return response.data;
  },

  getContractByClient: async (clientId: string): Promise<PROContract> => {
    const response = await api.get(`/pro/contracts/client/${clientId}`);
    return response.data;
  },

  getTasksByClient: async (clientId: string): Promise<PROTask[]> => {
    const response = await api.get(`/pro/tasks/client/${clientId}`);
    return response.data;
  },

  getDocumentsByClient: async (clientId: string): Promise<PRODocument[]> => {
    const response = await api.get(`/pro/documents/client/${clientId}`);
    return response.data;
  }
};
