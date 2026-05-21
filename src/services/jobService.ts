import api from "./api";
import type { Job } from "../types/project";

export const jobService = {
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get("/jobs");
    return response.data;
  },

  getJobsByClient: async (clientId: string): Promise<Job[]> => {
    const response = await api.get(`/jobs?clientId=${clientId}`);
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  updateJobStatus: async (id: string, status: Job["status"]): Promise<Job> => {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  },

  uploadJobDocument: async (id: string, file: File): Promise<{ url: string; name: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/jobs/${id}/documents`, formData);
    return response.data;
  },

  deleteJob: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};
