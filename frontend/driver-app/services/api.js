import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors (e.g., token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Optionally, you can implement token refresh logic here
      // For now, we'll just sign out the user
      try {
        await AsyncStorage.removeItem('userToken');
        // Navigate to login screen (not implemented yet)
        // You can use a navigation prop or event emitter to navigate
      } catch (e) {
        console.error('Error clearing token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;