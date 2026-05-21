import { z } from "zod";

/**
 * Zod schemas for runtime validation of API responses.
 * Prevents frontend crashes from malformed backend data.
 */

/** Schema for a single client in the list endpoint */
export const apiClientSchema = z.object({
  id: z.number(),
  client_code: z.string().nullable().optional(),
  name: z.string(),
  division: z.string().nullable().default(""),
  phone: z.string().nullable().default(""),
});

/** Schema for the paginated clients response */
export const clientsListResponseSchema = z.object({
  success: z.literal(true),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  data: z.array(apiClientSchema),
});

/** Schema for a single client detail */
export const apiClientDetailSchema = z.object({
  id: z.number(),
  clientCode: z.string(),
  division: z.string().nullable().default(""),
  companyName: z.string(),
  email: z.string().nullable().default(""),
  phone: z.string().nullable().default(""),
  licenses: z
    .array(z.object({ licenseName: z.string() }))
    .optional()
    .default([]),
  agreements: z
    .array(z.object({ title: z.string(), fileUrl: z.string() }))
    .optional()
    .default([]),
});

/** Schema for the client detail response */
export const clientDetailResponseSchema = z.object({
  success: z.literal(true),
  data: apiClientDetailSchema,
});

/** Schema for a generic success response (e.g., create/delete) */
export const genericSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/** Schema for create client response */
export const createClientResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  clientCode: z.string(),
});

/** Schema for login response */
export const loginResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    token: z.string(),
  }),
});

/** Inferred types from schemas */
export type ApiClientParsed = z.infer<typeof apiClientSchema>;
export type ClientsListResponseParsed = z.infer<typeof clientsListResponseSchema>;
export type ApiClientDetailParsed = z.infer<typeof apiClientDetailSchema>;
export type LoginResponseParsed = z.infer<typeof loginResponseSchema>;
