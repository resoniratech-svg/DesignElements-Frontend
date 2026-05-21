import type { DivisionId } from "../constants/divisions";

export type ProjectStatus = "Active" | "Ongoing" | "Completed" | "On Hold" | "Pending" | "In Progress" | "COMPLETED" | "Cancelled" | "CREATED";

export interface ProjectDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded
  uploadedAt: string;
}

export interface Project {
  id: string;
  projectName: string;
  name?: string; // Compatibility
  client: string;
  clientName?: string; // Compatibility
  client_name?: string; // Added for compatibility
  division: DivisionId;
  branch?: string; // Legacy
  status: ProjectStatus;
  startDate: string;
  deadline?: string;
  endDate?: string;
  value?: number;
  contract_value?: number | string; // Added for compatibility
  budget?: string | number; // Added for compatibility
  manager?: string; // Added for compatibility
  location?: string;
  description?: string; // Added
  jobCount?: number;
  createdAt?: string;
  documents?: ProjectDocument[];
  uploadedDocument?: File | string | null;
  uploaded_document?: File | string | null;
  client_id?: string | number | null;
  manager_id?: string | number | null;
}

export interface Job {
  id: string;
  jobId?: string; // Compatibility
  projectId?: string;
  project?: string;
  title: string;
  service?: string; // Compatibility
  description?: string;
  status: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  assignedTo?: string;
  branch?: string; // Compatibility
  clientName?: string;
  client?: string;
  serviceType?: string;
  JobType?: string;
  division?: string;
  name?: string; // Compatibility for Notifications
  createdAt?: string;
  startDate?: string;
}

export interface Milestone {
  label: string;
  date?: string;
  status: "completed" | "active" | "pending";
}
