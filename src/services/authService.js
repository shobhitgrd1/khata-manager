import api from './api';

export const authService = {
  // Login with email or username
  async login(identifier, password) {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data?.token) {
      localStorage.setItem('khata_token', response.data.token);
      localStorage.setItem('khata_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('khata_token', response.data.token);
      localStorage.setItem('khata_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Forgot password step 1: verify email and date of birth
  async verifyForgotPassword(email, dateOfBirth) {
    const response = await api.post('/auth/forgot-password/verify', {
      email,
      dateOfBirth,
    });
    return response.data;
  },

  // Forgot password step 2: reset password with token
  async resetPassword(resetToken, newPassword, confirmPassword) {
    const response = await api.post('/auth/forgot-password/reset', {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('khata_token');
      localStorage.removeItem('khata_user');
    }
  },

  // Get current authenticated user
  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data?.user) {
      localStorage.setItem('khata_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

export default authService;

