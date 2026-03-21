import axios from 'axios';
import { useAuthStore } from './auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

let refreshPromise: Promise<any> | null = null;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry / 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { logout } = useAuthStore.getState();
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (refreshToken) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios.post(`${API_URL}/auth/refresh`, { refreshToken })
              .finally(() => { refreshPromise = null; });
          }
          
          const res = await refreshPromise;
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          
          useAuthStore.setState({ accessToken });
          if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', newRefresh);
            // Sync cookie so Next.js middleware stays aware of the valid token
            document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`;
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh hit a 401 or failed, force logout
          logout();
          window.location.href = '/login';
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
