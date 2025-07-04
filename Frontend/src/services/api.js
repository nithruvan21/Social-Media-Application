import axios from 'axios';

// Base URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust if your backend runs elsewhere

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Adds the JWT token to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor (Example: handle 401 Unauthorized globally)
api.interceptors.response.use(
  (response) => {
    return response; // Pass through successful responses
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid
      console.error("Unauthorized! Redirecting to login.");
      // Clear token and redirect to login
      localStorage.removeItem('jwtToken');
      // Use window.location to redirect outside of React Router context if needed
      window.location.href = '/login';
      // Alternatively, you could integrate with your AuthContext logout function
    }
    return Promise.reject(error);
  }
);


export default api; // Export the configured axios instance