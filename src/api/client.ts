import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { attachMockInterceptor } from "../services/apiMock";

/**
 * Centralized Axios client for communicating with the Trek ERP backend.
 *
 * Features:
 *  - Reads base URL from VITE_API_URL environment variable
 *  - Automatically injects JWT Bearer token from localStorage
 *  - Global response interceptors for 401 (auth) and 500 (server) errors
 */

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// ─── Request Interceptor: inject JWT and Division ─────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Auth Injection
    const isLoginRequest = config.url?.includes("/auth/login");
    const token = localStorage.getItem("token");
    if (token && config.headers && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Division Injection
    const activeDivision = localStorage.getItem("trek_active_division");
    if (activeDivision && config.headers) {
      config.headers["x-division-id"] = activeDivision;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: global error handling ────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const status: number = error.response.status;

      if (status === 401) {
        // Token expired or invalid — clear auth state and redirect to login
        console.error("[API] 401 Unauthorized — clearing session");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      if (status === 403) {
        console.error("[API] 403 Forbidden — access denied");
        alert("Permission Denied: You do not have access to this resource or sector.");
      }

      if (status >= 500) {
        console.error(
          "[API] Server error:",
          error.response.data?.message || "Internal Server Error"
        );
      }
    } else if (error.request) {
      console.error("[API] No response received — network issue");
    }

    return Promise.reject(error);
  }
);

// Attach mock layer ONLY in development if needed
if (import.meta.env.DEV) {
  attachMockInterceptor(apiClient);
}

export default apiClient;
