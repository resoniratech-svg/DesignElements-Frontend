import apiClient from "../api/client";

export interface DeletedItemsResponse {
  quotations: any[];
  invoices: any[];
  deliveryNotes: any[];
  completionCertificates: any[];
  counts: {
    quotations: number;
    invoices: number;
    deliveryNotes: number;
    completionCertificates: number;
    total: number;
  };
}

export const restoreService = {
  getDeletedItems: async (division?: string): Promise<DeletedItemsResponse> => {
    const params: Record<string, string> = {};
    if (division && division !== "all") {
      params.division = division;
    }
    const response = await apiClient.get("/restore/items", { params });
    return response.data.data;
  },

  restoreItem: async (type: "quotation" | "invoice" | "delivery_note" | "completion_certificate", id: string | number) => {
    const response = await apiClient.post(`/restore/${type}/${id}`);
    return response.data;
  },

  permanentDeleteItem: async (type: "quotation" | "invoice" | "delivery_note" | "completion_certificate", id: string | number) => {
    const response = await apiClient.delete(`/restore/${type}/${id}/permanent`);
    return response.data;
  },

  deleteDeliveryNote: async (invoiceId: string | number) => {
    const response = await apiClient.delete(`/invoices/${invoiceId}/delivery-note`);
    return response.data;
  },

  deleteCertificate: async (invoiceId: string | number) => {
    const response = await apiClient.delete(`/invoices/${invoiceId}/certificate`);
    return response.data;
  }
};
