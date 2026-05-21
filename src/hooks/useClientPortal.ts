import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export function useClientDashboard() {
  return useQuery({
    queryKey: ["client-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/client/dashboard");
      return data?.data || data;
    },
    refetchInterval: 30000, // Real-time polling every 30 seconds
  });
}

export function useClientDocuments() {
  return useQuery({
    queryKey: ["client-documents"],
    queryFn: async () => {
      const { data } = await api.get("/client/documents");
      return data?.data || data;
    },
  });
}

export function useUploadClientDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      // In a real app, you would use FormData:
      // const formData = new FormData();
      // formData.append("file", file);
      // const { data } = await api.post(`/client/documents/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const { data } = await api.post(`/client/documents/${id}/upload`, { fileName: file.name });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents"] });
      queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
    },
  });
}

export function useClientTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["client-tasks"],
    queryFn: async () => {
      const { data } = await api.get("/client/tasks");
      return data?.data || data;
    },
    refetchInterval: 30000,
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/client/tasks/${id}`, { status });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tasks"] });
    },
  });

  return { ...query, updateTask };
}

export function useClientContracts() {
  return useQuery({
    queryKey: ["client-contracts"],
    queryFn: async () => {
      const { data } = await api.get("/client/contracts");
      return data?.data || data;
    },
  });
}

export function useClientProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["client-profile"],
    queryFn: async () => {
      const { data } = await api.get("/client/profile");
      return data?.data || data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updatedData: any) => {
      const { data } = await api.put("/client/profile", updatedData);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
    },
  });

  return { ...query, updateProfile };
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data?.data || data;
    },
    refetchInterval: 15000, // Check for new alerts every 15 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/notifications/${id}/read`, {});
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return { ...query, markAsRead };
}
export function useClientBillingSummary() {
  return useQuery({
    queryKey: ["client-billing-summary"],
    queryFn: async () => {
      const { data } = await api.get("/portal/billing/summary");
      return data?.data || data;
    },
  });
}

export function useClientInvoices() {
  return useQuery({
    queryKey: ["client-invoices"],
    queryFn: async () => {
      const { data } = await api.get("/portal/billing/invoices");
      return data?.data || data;
    },
  });
}
