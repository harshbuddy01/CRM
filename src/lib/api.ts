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
          // Deduplicate: all parallel 401'd requests share one refresh call
          if (!refreshPromise) {
            refreshPromise = axios.post(`${API_URL}/auth/refresh`, { refreshToken })
              .then((res) => {
                const { accessToken, refreshToken: newRefresh } = res.data.data;
                
                useAuthStore.setState({ accessToken });
                if (typeof window !== 'undefined') {
                  localStorage.setItem('refreshToken', newRefresh);
                  document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=strict`;
                }
                return accessToken;
              })
              .catch((refreshError) => {
                // Refresh failed — force logout once
                logout(); 
                if (typeof window !== 'undefined') {
                  window.stop();
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('auth-storage');
                  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
                  
                  // Only redirect to login if we are NOT on a public share page
                  if (!window.location.pathname.startsWith('/share')) {
                    window.location.href = '/login';
                  }
                }
                return Promise.reject(refreshError);
              })
              .finally(() => { refreshPromise = null; });
          }
          
          const newToken = await refreshPromise;

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          // Refresh already handled logout above
          return Promise.reject(error);
        }
      } else {
        logout();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
          
          // Only redirect to login if we are NOT on a public share page
          if (!window.location.pathname.startsWith('/share')) {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
