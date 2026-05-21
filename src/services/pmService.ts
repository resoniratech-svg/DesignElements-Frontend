import api from "./api";

export const pmService = {
  getDashboardStats: async () => {
    const response = await api.get("/pm/dashboard-stats");
    return response.data?.data || response.data;
  }
};
