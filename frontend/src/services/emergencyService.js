import api from "./api";

export const emergencyService = {
  list: async (params) => {
    const { data } = await api.get("/emergency-requests", { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/emergency-requests/add", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/emergency-requests/update/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/emergency-requests/${id}`);
    return data;
  },
  approve: async (id) => {
    const { data } = await api.patch(`/emergency-requests/${id}/approve`);
    return data;
  },
  forwardToApp: async (id, notes) => {
    const { data } = await api.patch(`/emergency-requests/${id}/forward-to-app`, { notes });
    return data;
  },
  assignDonor: async (id, assignedDonor) => {
    const { data } = await api.patch(`/emergency-requests/${id}/assign`, { assignedDonor });
    return data;
  },
  resolve: async (id) => {
    const { data } = await api.patch(`/emergency-requests/${id}/resolve`);
    return data;
  },
};
