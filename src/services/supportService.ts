import api from "./api";

export interface SupportChannel {
  id?: number;
  title: string;
  desc: string;
  icon: string;
  email: string;
  phone: string;
  color: string;
  sector: string;
}

export const supportService = {
  getChannels: async () => {
    const response = await api.get('/support');
    return response.data.data;
  },
  
  createChannel: async (channel: SupportChannel) => {
    const response = await api.post('/support', channel);
    return response.data.data;
  },

  updateChannel: async (id: number, channel: SupportChannel) => {
    const response = await api.put(`/support/${id}`, channel);
    return response.data.data;
  },

  deleteChannel: async (id: number) => {
    const response = await api.delete(`/support/${id}`);
    return response.data.data;
  }
};
