const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('token');
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.log('API error data:', data);
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.removeAuthToken();
    }
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // User endpoints
  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateUserProfile(data) {
    return this.put('/users/profile', data);
  }

  async getUserNotifications() {
    return this.get('/users/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.put(`/users/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    return this.put('/users/notifications/read-all');
  }

  async getUserAchievements() {
    return this.get('/users/achievements');
  }

  // Question endpoints
  async getQuestions(params = {}) {
    return this.get('/questions', params);
  }

  async getQuestion(id) {
    return this.get(`/questions/${id}`);
  }

  async createQuestion(questionData) {
    return this.post('/questions', questionData);
  }

  async updateQuestion(id, questionData) {
    return this.put(`/questions/${id}`, questionData);
  }

  async deleteQuestion(id) {
    return this.delete(`/questions/${id}`);
  }

  async markQuestionSolved(id) {
    return this.put(`/questions/${id}/solve`);
  }

  async getUserQuestions(userId, params = {}) {
    return this.get(`/questions/user/${userId}`, params);
  }

  // Response endpoints
  async createResponse(responseData) {
    return this.post('/responses', responseData);
  }

  async updateResponse(id, responseData) {
    return this.put(`/responses/${id}`, responseData);
  }

  async deleteResponse(id) {
    return this.delete(`/responses/${id}`);
  }

  async markResponseHelpful(id) {
    return this.put(`/responses/${id}/helpful`);
  }

  async voteOnResponse(id, voteType) {
    return this.put(`/responses/${id}/vote`, { type: voteType });
  }

  async getUserResponses(userId, params = {}) {
    return this.get(`/responses/user/${userId}`, params);
  }

  // Payment endpoints
  async processPayment(paymentData) {
    return this.post('/payments', paymentData);
  }

  async getPaymentHistory(params = {}) {
    return this.get('/payments', params);
  }

  async getPayment(id) {
    return this.get(`/payments/${id}`);
  }

  async getPaymentStats() {
    return this.get('/payments/stats/summary');
  }

  // Leaderboard endpoints
  async getLeaderboard(params = {}) {
    return this.get('/leaderboard', params);
  }

  async getLeaderboardStats() {
    return this.get('/leaderboard/stats');
  }

  async getTopContributors() {
    return this.get('/leaderboard/top-contributors');
  }
}

export default new ApiService();