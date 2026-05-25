import api from "./api";

export const authService = {
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  },
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  },
  getProfile: async () => {
    const { data } = await api.get("/auth/profile");
    return data.data;
  },
  listPendingUsers: async () => {
    const { data } = await api.get("/auth/pending-users");
    return data.data;
  },
  approvePendingUser: async (id) => {
    const { data } = await api.patch(`/auth/pending-users/${id}/approve`);
    return data.data;
  },
  rejectPendingUser: async (id, rejectionReason = "") => {
    const { data } = await api.patch(`/auth/pending-users/${id}/reject`, { rejectionReason });
    return data.data;
  },
  listUsers: async (params = {}) => {
    const { data } = await api.get("/auth/users", { params });
    return data.data;
  },
  getUserHistory: async (id) => {
    const { data } = await api.get(`/auth/users/${id}/history`);
    return data.data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    return data.data;
  },
};
