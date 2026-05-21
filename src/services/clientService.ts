import apiClient from "./api";

export interface Client {
  id: string;
  name: string;
  division: string;
  sector?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  userId?: string | number;
  companyName?: string;
}

export const clientService = {
  getClients: async (
    filters?: {
      sector?: string;
      division?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Client[]; total: number }> => {
    const cleanFilters: any = {};

    if (filters?.division)
      cleanFilters.division = filters.division.toUpperCase();

    if (filters?.sector)
      cleanFilters.sector = filters.sector.toUpperCase();

    if (filters?.page)
      cleanFilters.page = filters.page;

    if (filters?.limit)
      cleanFilters.limit = filters.limit;

    const response = await apiClient.get("/clients", {
      params: cleanFilters,
    });

    const body = response.data;
    const rows = body?.data || [];
    const total =
      body?.total || (Array.isArray(rows) ? rows.length : 0);

    return {
      data: rows.map((client: any) => ({
        id: String(client.id),
        userId: client.user_id,

        // Client/contact name
        name: client.name || "N/A",

        // Fix: don't fallback to client.name
        companyName: client.companyName ?? "",

        division: client.division,
        sector: client.sector || client.division,
        email: client.email || "N/A",
        phone: client.phone || "N/A",
        address: client.address,
        contactPerson:
          client.contact_person ||
          client.contactPerson ||
          "N/A",
      })),

      total: total,
    };
  },

  createClient: async (clientData: any) => {
    const response = await apiClient.post(
      "/clients",
      clientData
    );
    return response.data;
  },

  getClient: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/clients/${id}`);

    console.log(
      "[DEBUG] getClient response:",
      response.data
    );

    const client =
      response.data?.data || response.data;

    return {
      id: String(client.id),

      // Contact person only
      name:
        client.contact_person ||
        client.contactPerson ||
        "",

      // Fix: keep company blank if not entered
      companyName: client.companyName ?? "",

      clientCode:
        client.client_code ||
        client.clientCode,

      division: client.division,
      sector:
        client.sector || client.division,

      email: client.email || "",
      phone: client.phone || "",
      address: client.address,

      contactPerson:
        client.contact_person ||
        client.contactPerson ||
        "",

      creditLimit:
        client.credit_limit ||
        client.creditLimit,

      // Business documents
      qid: client.qid,
      qidDocUrl:
        client.qid_doc_url ||
        client.qidDocUrl,

      crNumber:
        client.cr_number ||
        client.crNumber,

      crDocUrl:
        client.cr_doc_url ||
        client.crDocUrl,

      computerCard:
        client.computer_card ||
        client.computerCard,

      computerCardDocUrl:
        client.computer_card_doc_url ||
        client.computerCardDocUrl,

      contractDocUrl:
        client.contract_doc_url ||
        client.contractDocUrl,

      // Contract details
      contractType:
        client.contract_type ||
        client.contractType,

      startDate:
        client.start_date ||
        client.startDate,

      renewalDate:
        client.renewal_date ||
        client.renewalDate,

      // Licenses & agreements
      licenses:
        client.licenses || [],

      agreements:
        client.agreements || [],
    };
  },

  updateClient: async (
    id: string,
    clientData: any
  ) => {
    const response = await apiClient.put(
      `/clients/${id}`,
      clientData
    );

    return response.data;
  },

  deleteClient: async (id: string) => {
    const response = await apiClient.delete(
      `/clients/${id}`
    );

    return response.data;
  },
};