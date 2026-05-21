import api from "./api";
import type { AdminDashboardData } from "../types/admin";

export const adminService = {
  getDashboardStats: async (division?: string): Promise<AdminDashboardData> => {
    const response = await api.get("/admin/dashboard-stats", { params: { division } });
    return response.data.data || response.data;
  }
};
