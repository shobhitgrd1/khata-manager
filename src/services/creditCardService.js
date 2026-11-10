import api from './api';

export const creditCardService = {
  // Get all credit cards for authenticated user (supports search, bank filter)
  async getCreditCards(params = {}) {
    const response = await api.get('/credit-cards', { params });
    return response.data;
  },

  // Get aggregated summary statistics
  async getCreditCardSummary() {
    const response = await api.get('/credit-cards/summary');
    return response.data;
  },

  // Get single credit card details
  async getCreditCardById(id) {
    const response = await api.get(`/credit-cards/${id}`);
    return response.data;
  },

  // Create a new credit card
  async createCreditCard(cardData) {
    const response = await api.post('/credit-cards', cardData);
    return response.data;
  },

  // Update credit card (name, bank, limits)
  async updateCreditCard(id, cardData) {
    const response = await api.put(`/credit-cards/${id}`, cardData);
    return response.data;
  },

  // Delete a credit card
  async deleteCreditCard(id) {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
  },

  // Get transaction history for a specific credit card
  async getTransactions(id, params = {}) {
    const response = await api.get(`/credit-cards/${id}/transactions`, { params });
    return response.data;
  },

  // Record a transaction (Pay Credit Card or Use Credit Card)
  async addTransaction(id, data) {
    const response = await api.post(`/credit-cards/${id}/transactions`, data);
    return response.data;
  },

  // Reverse an incorrect credit card transaction
  async reverseTransaction(id, transactionId, data = {}) {
    const response = await api.post(`/credit-cards/${id}/transactions/${transactionId}/reverse`, data);
    return response.data;
  },
};

export default creditCardService;

