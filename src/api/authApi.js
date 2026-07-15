/**
 * @file src/api/authApi.js
 * @description API calls for authentication endpoints.
 */

import api from "./axiosInstance";

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
  forgotPassword: (phone) => api.post("/auth/forgot-password", { phone }),
  resetPassword: (token, new_password) => api.post("/auth/reset-password", { token, new_password }),
};
