import api from './api';

export const userService = {
  // Get all users with server pagination, search, sorting
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user metrics
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get single user by ID
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (Admin only)
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user details
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;

