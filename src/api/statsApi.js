/**
 * @file src/api/statsApi.js
 * @description API calls for dashboard statistics endpoints.
 */

import api from "./axiosInstance";

export const statsApi = {
  getOverview: () => api.get("/stats/overview"),
  getRevenue: (params) => api.get("/stats/revenue", { params }),
  getCourtOccupancy: (params) => api.get("/stats/court-occupancy", { params }),
};
