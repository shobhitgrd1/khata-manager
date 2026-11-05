import api from './api';

const dealerService = {
  async getDealers(params = {}) {
    const response = await api.get('/dealers', { params });
    return response.data;
  },

  async getDealerSummary() {
    const response = await api.get('/dealers/summary');
    return response.data;
  },

  async getDealerById(id) {
    const response = await api.get(`/dealers/${id}`);
    return response.data;
  },

  async createDealer(data) {
    const response = await api.post('/dealers', data);
    return response.data;
  },

  async updateDealer(id, data) {
    const response = await api.put(`/dealers/${id}`, data);
    return response.data;
  },

  async deleteDealer(id) {
    const response = await api.delete(`/dealers/${id}`);
    return response.data;
  },
};

export default dealerService;

