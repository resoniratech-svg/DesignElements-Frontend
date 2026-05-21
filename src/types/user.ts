import type { DivisionId } from "../constants/divisions";

export type Role =
  | "SUPER_ADMIN"
  | "ACCOUNTS"
  | "PROJECT_MANAGER"
  | "CLIENT"
  | "HR"
  | "MANAGER"
  | "EMPLOYEE";

export interface User {
  id: string; // userId
  name: string;
  email: string;
  password?: string; // Only for mock auth
  role: Role;
  token?: string;
  division?: DivisionId;
  phone?: string;
  profileImage?: string;
  status?: "Active" | "Inactive" | "Suspended";
  lastLogin?: string;
  employeeId?: string; // Link to employee record
  assignedClients?: string[]; // IDs of clients assigned to this user
  company_name?: string;
  address?: string;
  qid?: string;
  cr_number?: string;
  computer_card?: string;
  start_date?: string;
  renewal_date?: string;
  contract_type?: string;
  password_plain?: string;
}

/** Maps each role to its default dashboard path after login */
export const ROLE_DASHBOARD_MAP: Record<Role, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ACCOUNTS: "/accounts/dashboard",
  PROJECT_MANAGER: "/pm/dashboard",
  CLIENT: "/dashboard",
  HR: "/admin/dashboard",
  MANAGER: "/pm/dashboard",
  EMPLOYEE: "/dashboard",
};