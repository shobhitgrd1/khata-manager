import api from './api';

const accountService = {
  async getAccounts(params = {}) {
    const response = await api.get('/accounts', { params });
    return response.data;
  },
  async getAccountSummary() {
    const response = await api.get('/accounts/summary');
    return response.data;
  },
  async getAccountById(id) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  async createAccount(data) {
    const response = await api.post('/accounts', data);
    return response.data;
  },
  async updateAccount(id, data) {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },
  async deleteAccount(id) {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
};

export default accountService;
