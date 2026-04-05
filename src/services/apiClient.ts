import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://society-management-backend-zl7v.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default apiClient;
