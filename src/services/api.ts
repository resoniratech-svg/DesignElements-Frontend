import axios, { type AxiosInstance } from "axios";
// import { attachMockInterceptor } from "./apiMock";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request Interceptor: inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("[API] 401 Unauthorized — clearing session");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Attach mock layer ONLY in development if needed
if (import.meta.env.DEV) {
  // attachMockInterceptor(api);
}

// Helper to get full URL for uploaded files
export const getUploadUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default api;