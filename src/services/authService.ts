import apiClient from "../api/client";
import { loginResponseSchema } from "../schemas/clientSchema";
import type { User } from "../types/user";

/**
 * Auth service — connects to the real backend POST /auth/login.
 * Falls back to mock credentials if the backend is unreachable.
 */
export const authService = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      // Validate response with Zod
      const parsed = loginResponseSchema.parse(response.data);
      const token = parsed.data.token;

      // Decode JWT payload to extract user info (base64url → JSON)
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload: { 
        userId: number; 
        role: string; 
        client_id?: number;
        division?: string;
        sector?: string;
      } = JSON.parse(payloadJson);

      const user: User = {
        id: String(payload.userId),
        name: credentials.email.split("@")[0], // Best available from JWT
        email: credentials.email,
        role: payload.role as User["role"],
        token,
        division: (payload.sector || payload.division)?.toLowerCase() as any,
      };

      // Persist token for API client interceptor
      localStorage.setItem("token", token);

      return { user, token };
    } catch (err: unknown) {
      // If backend is down, let the error propagate
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message =
        axiosError?.response?.data?.message || "Login failed — server unreachable";
      throw new Error(message);
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    localStorage.removeItem("token");
    return { success: true };
  },
};
