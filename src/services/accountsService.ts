import api from "./api";
import type { AccountsDashboardData } from "../types/finance";

export const accountsService = {
  getDashboardStats: async (): Promise<AccountsDashboardData> => {
    const { data } = await api.get("/accounts/dashboard-stats");
    return data.data || data;
  }
};
