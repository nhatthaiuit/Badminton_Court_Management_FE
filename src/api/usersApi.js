import api from "./axiosInstance";

export const usersApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data), // Create new user with RBAC
  update: (id, data) => api.put(`/users/${id}`, data), // Update user info
  updateRole: (id, role) => api.patch(`/users/${id}`, { role }),
};
