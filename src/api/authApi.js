/**
 * @file src/api/authApi.js
 * @description API calls for authentication endpoints.
 */

import api from "./axiosInstance";

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
};
