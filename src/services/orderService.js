import api from './api';

const orderService = {
  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrderSummary() {
    const response = await api.get('/orders/summary');
    return response.data;
  },

  async getOrderPerformance(params = {}) {
    const response = await api.get('/orders/performance', { params });
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateOrder(id, data) {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  async deliverOrder(id, data) {
    const response = await api.patch(`/orders/${id}/deliver`, data);
    return response.data;
  },

  async correctDeliveryPrice(id, data) {
    const response = await api.patch(`/orders/${id}/delivery-price`, data);
    return response.data;
  },

  async deleteOrder(id) {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;

