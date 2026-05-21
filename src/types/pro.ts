

export type TaskStatus = "Todo" | "In Progress" | "Completed" | "Pending";
export type TaskPriority = "Low" | "Medium" | "High";

export interface PROTask {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category?: string;
  assignedTo?: string;
}

export interface PRODocument {
  id: string;
  clientId: string;
  type: string;
  number: string;
  expiryDate: string;
  fileUrl?: string;
  status: "Active" | "Expiring" | "Expired";
}

export interface PRONotification {
  id: string;
  clientId?: string;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Alert" | "General";
  date: string;
  isRead: boolean;
}

export interface PROContract {
  id: string;
  clientId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Terminated" | "Renewed";
  value?: number;
  type?: string;
  monthlyFee?: number;
}
