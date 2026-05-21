import api from "./api";

export interface CreditRequest {
    id: number;
    client_id: number;
    client_name?: string;
    amount: number;
    reason: string;
    notes?: string;
    approval_status: string;
    created_at: string;
    updated_at: string;
    requester_name?: string;
}

export const creditRequestService = {
    getAllRequests: async (filters: any = {}): Promise<CreditRequest[]> => {
        const response = await api.get("/credit-requests", { params: filters });
        return response.data.data;
    },

    getRequestById: async (id: number | string): Promise<CreditRequest> => {
        const response = await api.get(`/credit-requests/${id}`);
        return response.data.data;
    },

    createRequest: async (data: any): Promise<CreditRequest> => {
        const response = await api.post("/credit-requests", data);
        return response.data.data;
    },

    updateRequest: async (id: number | string, data: any): Promise<CreditRequest> => {
        const response = await api.put(`/credit-requests/${id}`, data);
        return response.data.data;
    },

    deleteRequest: async (id: number | string): Promise<void> => {
        await api.delete(`/credit-requests/${id}`);
    }
};
