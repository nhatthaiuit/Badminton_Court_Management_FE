import api from "./axiosInstance";

export const usersApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/auth/register", data), // Register new user
  updateRole: (id, role) => api.patch(`/users/${id}`, { role }),
};
