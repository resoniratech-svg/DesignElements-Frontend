import api from "./api";
import type { Project } from "../types/project";

// Map a PostgreSQL row (snake_case) to the frontend Project shape (camelCase)
function mapProject(row: any): Project {
  return {
    id: String(row.id),
    projectName: row.project_name || row.projectName || "",
    name: row.project_name || row.name || row.projectName || "",
    client: row.client_name || row.client || "",
    clientName: row.client_name || row.clientName || "",
    division: row.division || row.branch || "contracting",
    branch: row.division || row.branch || "",
    status: row.status || "Pending",
    startDate: (row.start_date || row.startDate || "")
      ?.split("T")[0],
    endDate: (row.end_date || row.endDate || "")
      ?.split("T")[0],
    deadline: row.end_date || row.deadline || "",
    budget: row.contract_value || row.budget || "",
    value: Number(row.contract_value) || row.value || 0,
    manager: row.manager || "",
    description: row.description || "",
    createdAt: row.created_at || row.createdAt || "",
    documents: row.documents || [],
    uploadedDocument: row.uploaded_document || row.uploadedDocument || null,
    client_id: row.client_id || row.clientId || null,
    manager_id: row.manager_id || row.managerId || null,
  };
}

export const projectService = {
  getProjects: async (division?: string, page: number = 1, limit: number = 10): Promise<{ data: Project[], total: number }> => {
    const response = await api.get("/projects", { params: { division, page, limit } });
    const body = response.data;
    const rows = body?.data?.data || body?.data || [];
    const total = body?.data?.total || (Array.isArray(rows) ? rows.length : 0);
    if (rows.length > 0) console.log("PROJECT DATA SAMPLE:", mapProject(rows[0]));

    return {
      data: Array.isArray(rows) ? rows.map(mapProject) : [],
      total: total
    };
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  createProject: async (projectData: any): Promise<any> => {
    const response = await api.post("/projects", projectData);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};
