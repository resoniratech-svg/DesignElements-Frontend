/**
 * Shared API response types — strict TypeScript, no `any`.
 * Mirrors the backend's standard response envelope from utils/response.ts
 */

/** Standard success response from the backend */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/** Standard error response from the backend */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

/** Union type representing any backend response */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Paginated list response from backend (e.g., GET /clients) */
export interface PaginatedResponse<T> {
  success: true;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

/** Auth login response payload */
export interface LoginResponsePayload {
  token: string;
}

/** Client as returned by the backend GET /clients list endpoint */
export interface ApiClient {
  id: number;
  client_code: string;
  name: string;
  division: string;
  phone: string;
}

/** Client as returned by the backend GET /clients/:id detail endpoint */
export interface ApiClientDetail {
  id: number;
  clientCode: string;
  division: string;
  companyName: string;
  email: string;
  phone: string;
  licenses: { licenseName: string }[];
  agreements: { title: string; fileUrl: string }[];
}

/** Payload for creating a client via POST /clients */
export interface CreateClientPayload {
  companyName: string;
  division: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  licenses?: string[];
  agreements?: {
    title: string;
    fileUrl: string;
    startDate: string;
    endDate: string;
  }[];
}

/** Payload for updating a client via PUT /clients/:id */
export interface UpdateClientPayload {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}
