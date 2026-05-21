import api from "./api";
import type { Employee, EmployeeDashboardData } from "../types/employee";

export const employeeService = {
  getEmployees: async (division?: string): Promise<Employee[]> => {
    const { data } = await api.get("/employees", { params: { division } });
    return data.data || data;
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const { data } = await api.get(`/employees/${id}`);
    return data.data || data;
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const { data: resData } = await api.post("/employees", data);
    return resData.data || resData;
  },

  updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const { data: resData } = await api.put(`/employees/${id}`, data);
    return resData.data || resData;
  },

  deleteEmployee: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete(`/employees/${id}`);
    return data.data || data;
  },

  getDashboardStats: async (division?: string): Promise<EmployeeDashboardData> => {
    const { data } = await api.get("/employees/dashboard-stats", { params: { division } });
    return data.data || data;
  }
};
