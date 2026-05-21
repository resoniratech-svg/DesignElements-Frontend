import api from "./api";

export interface QuotationItem {
  description: string;
  quantity: number;
  unit: string; // Added
  unitPrice: number;
  amount: number;
  image?: string; // Added
  customSrNo?: string; // Added
}

/** Quotation object representing the database schema */
export interface Quotation {
  id?: string;
  qtn_number: string;
  client_id: string | number;
  division: string;
  total_amount: number;
  status: string;
  Status?: string; // Legacy
  items: QuotationItem[];
  project_name?: string;
  project?: string;
  client?: string;
  discount?: number;
  aboutUs?: string;
  whatWeDo?: string;
  proposalIntro?: string;
  financialTerms?: string;
  clientDuties?: string;
  paymentTerms?: string;
  valid_until?: string;
  terms?: string;
  client_name?: string;
  client_company?: string;
  client_phone?: string; // Added
  client_email?: string; // Added
  attn?: string;
  attn_designation?: string;
  salutation?: string;
  reference_no?: string;
  intro_text?: string;
  tc_terms?: string;
  tc_payment?: string;
  tc_delivery?: string;
  tc_validity?: string;
  tc_installation?: string; // Added
  outro_text?: string;
  salesman?: string;
  salesman_designation?: string;
  salesman_phone?: string;
  salesman_email?: string;
  created_at?: string;
  selected_format?: string; // Added
  netTotal?: number; // Added for compatibility
}

export const quotationService = {
  getQuotations: async (page: number = 1, limit: number = 10, division?: string): Promise<{ data: Quotation[], total: number }> => {
    const { data } = await api.get("/quotations", { params: { page, limit, division } });
    const rows = data.data?.data || data.data || [];
    const total = data.data?.total || (Array.isArray(rows) ? rows.length : 0);
    return { data: rows, total };
  },

  getQuotation: async (id: string): Promise<Quotation> => {
    const { data } = await api.get(`/quotations/${id}`);
    return data.data;
  },

  createQuotation: async (quotationData: Partial<Quotation>): Promise<Quotation> => {
    const response = await api.post("/quotations", quotationData);
    return response.data.data;
  },

  updateQuotation: async (id: string, quotationData: Partial<Quotation>): Promise<Quotation> => {
    const { data } = await api.put(`/quotations/${id}`, quotationData);
    return data.data;
  },

  getNextNumber: async (division: string): Promise<string> => {
    const { data } = await api.get(`/quotations/next-number/${division}`);
    return data.data.nextNumber;
  },

  deleteQuotation: async (id: string): Promise<void> => {
    await api.delete(`/quotations/${id}`);
  }
};
