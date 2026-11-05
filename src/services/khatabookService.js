import api from './api';

const khatabookService = {
  async getKhataBooks(params = {}) {
    const response = await api.get('/khatabook', { params });
    return response.data;
  },

  async getKhataBookById(id) {
    const response = await api.get(`/khatabook/${id}`);
    return response.data;
  },

  async createKhataBook(data) {
    const response = await api.post('/khatabook', data);
    return response.data;
  },

  async updateKhataBook(id, data) {
    const response = await api.put(`/khatabook/${id}`, data);
    return response.data;
  },

  async archiveKhataBook(id) {
    const response = await api.delete(`/khatabook/${id}`);
    return response.data;
  },

  async getTransactions(id, params = {}) {
    const response = await api.get(`/khatabook/${id}/transactions`, { params });
    return response.data;
  },

  async addTransaction(id, data) {
    const response = await api.post(`/khatabook/${id}/transactions`, data);
    return response.data;
  },

  async recordPayment(id, data) {
    const response = await api.post(`/khatabook/${id}/payments`, data);
    return response.data;
  },

  async updateTransaction(id, transactionId, data) {
    const response = await api.put(`/khatabook/${id}/transactions/${transactionId}`, data);
    return response.data;
  },

  async reverseTransaction(id, transactionId, data = {}) {
    const response = await api.post(`/khatabook/${id}/transactions/${transactionId}/reverse`, data);
    return response.data;
  },

  async getKhataBookByDealerId(dealerId) {
    const response = await api.get(`/khatabook/by-dealer/${dealerId}`);
    return response.data;
  },

  async getStatement(id, params = {}) {
    const response = await api.get(`/khatabook/${id}/statement`, { params });
    return response.data;
  },
};

export default khatabookService;

