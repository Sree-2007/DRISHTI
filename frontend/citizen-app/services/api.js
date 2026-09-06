import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await require('@react-native-async-storage/async-storage').getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not get token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;