/**
 * @file src/api/courtsApi.js
 * @description API calls for court management endpoints.
 */

import api from "./axiosInstance";

export const courtsApi = {
  getAll: (params) => api.get("/courts", { params }),
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post("/courts", data),
  update: (id, data) => api.put(`/courts/${id}`, data),
  delete: (id) => api.delete(`/courts/${id}`),
};
