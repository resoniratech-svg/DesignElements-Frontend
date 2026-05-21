import type { DivisionId } from "../constants/divisions";

export type EmployeeStatus = "Active" | "Inactive" | "On Leave" | "Terminated";

export interface EmployeeDocument {
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  division: DivisionId;
  status: EmployeeStatus;
  company?: string;
  joinDate: string;
  joinedDate?: string; // Compatibility
  department?: string;
  address?: string;
  qidNumber?: string;
  qidExpiry?: string;
  passportNumber?: string;
  passportExpiry?: string;
  profileImage?: string;
  visaExpiry?: string;
  baseSalary?: number;
  allowances?: number;
  totalSalary?: number;
  documents?: EmployeeDocument[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  expiringDocs: number;
  expiredDocs: number;
}

export interface EmployeeDashboardAlert {
  employeeId: string;
  employeeName: string;
  docType: string;
  expiryDate: string;
  daysRemaining: number;
  isExpired: boolean;
}

export interface EmployeeDashboardData {
  stats: EmployeeStats;
  alerts: EmployeeDashboardAlert[];
  recentEmployees: Employee[];
}
