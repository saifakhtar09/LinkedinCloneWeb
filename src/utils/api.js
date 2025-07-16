import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (response?.status === 403) {
      toast.error('Access denied');
    } else if (response?.status === 404) {
      toast.error('Resource not found');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  refreshToken: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/users/upload-profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCoverPhoto: (file) => {
    const formData = new FormData();
    formData.append('coverPhoto', file);
    return api.post('/users/upload-cover-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  sendConnectionRequest: (userId) => api.post(`/users/connect/${userId}`),
  getConnections: () => api.get('/users/connections'),
  acceptConnection: (connectionId) => api.patch(`/users/connections/${connectionId}/accept`),
  rejectConnection: (connectionId) => api.patch(`/users/connections/${connectionId}/reject`),
};

export const postAPI = {
  getPosts: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.media) {
      Array.from(postData.media).forEach((file) => {
        formData.append('media', file);
      });
    }
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  commentOnPost: (postId, content) => api.post(`/posts/${postId}/comment`, { content }),
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  reportPost: (postId, reason) => api.post(`/posts/${postId}/report`, { reason }),
};

export const jobAPI = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyForJob: (id, applicationData) => api.post(`/jobs/${id}/apply`, applicationData),
  getApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateApplicationStatus: (jobId, applicationId, status) =>
    api.patch(`/jobs/${jobId}/applications/${applicationId}`, { status }),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/conversation/${userId}`),
  sendMessage: (receiverId, content) => api.post('/messages', { receiver: receiverId, content }),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),
};

export const companyAPI = {
  getCompanies: () => api.get('/companies'),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (companyData) => api.post('/companies', companyData),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
  followCompany: (id) => api.post(`/companies/${id}/follow`),
  getFollowedCompanies: () => api.get('/companies/followed'),
};

export const analyticsAPI = {
  getUserAnalytics: (userId) => api.get(`/analytics/user/${userId}`),
  getPostAnalytics: (postId) => api.get(`/analytics/post/${postId}`),
  getJobAnalytics: (jobId) => api.get(`/analytics/job/${jobId}`),
  getPlatformAnalytics: (period = '30d') => api.get(`/analytics/platform?period=${period}`),
};

export default api;