import apiClient from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  sector?: string;
  division?: string;
  status: "active" | "inactive";
  lastActive: string;
  // NEW Client fields
  company_name?: string;
  company?: string; // mapping alias
  address?: string;
  qid?: string;
  cr_number?: string;
  computer_card?: string;
  start_date?: string;
  renewal_date?: string;
  contract_type?: string;
  password_plain?: string;
}

export const userService = {
  getUsers: async (filters?: { sector?: string; role?: string }): Promise<User[]> => {
    // Robustly handle optional filters to avoid passing React Query context
    const cleanFilters = (filters && typeof filters === "object" && ("sector" in filters || "role" in filters))
      ? filters
      : undefined;

    const response = await apiClient.get("/users", { params: cleanFilters });
    // Ensure data exists and map properly
    const data = response.data?.data || response.data || [];
    return data.map((user: any) => ({
      id: String(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      sector: user.sector,
      division: user.division,
      status: user.status || "active",
      lastActive: user.updated_at || user.created_at || new Date().toISOString(),
      company_name: user.company_name,
      company: user.company_name, // Alias for compatibility
      address: user.address,
      qid: user.qid,
      cr_number: user.cr_number,
      computer_card: user.computer_card,
      start_date: user.start_date,
      renewal_date: user.renewal_date,
      contract_type: user.contract_type,
      password_plain: user.password_plain
    }));
  },

  createUser: async (userData: any) => {
    const cleanedData = {
      ...userData,
      email: userData.email?.trim() || null,
    };

    const response = await apiClient.post("/users", cleanedData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const cleanedData = {
      ...userData,
      email: userData.email?.trim() || null,
    };

    const response = await apiClient.patch(`/users/${id}`, cleanedData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
