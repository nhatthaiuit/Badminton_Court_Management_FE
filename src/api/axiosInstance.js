/**
 * @file src/api/axiosInstance.js
 * @description Configured Axios HTTP client.
 *              Automatically attaches the JWT token from localStorage to every request
 *              and handles 401 Unauthorized responses by redirecting to login.
 */

import axios from "axios";

// Base URL comes from Vite environment variable (set in .env)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10-second request timeout
});

// ── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attach the stored JWT token to every outgoing request's Authorization header.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bcms_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Handle 401 Unauthorized globally: clear auth data and redirect to login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // Do not intercept 401 for login endpoint so that the login form can show the error properly
    if (error.response?.status === 401 && originalRequest.url !== '/auth/login') {
      localStorage.removeItem("bcms_token");
      localStorage.removeItem("bcms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
