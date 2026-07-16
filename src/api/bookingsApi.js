/**
 * @file src/api/bookingsApi.js
 * @description API calls for booking management endpoints.
 */

import api from "./axiosInstance";

export const bookingsApi = {
  getAll: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};
