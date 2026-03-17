import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Need this to send HTTPOnly cookies for refresh tokens
});

// Add interceptor to retry with refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const res = await api.post("/auth/refresh");
        // Update new access token in headers if you use Authorization instead of cookies for access
        // Assuming your backend is setting access token as well, or you store it in Zustand
        
        // If successful, retry
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired -> redirect to login
        if (typeof window !== "undefined") {
           window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
