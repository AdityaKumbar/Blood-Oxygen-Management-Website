import api from "./api";

export const oxygenService = {
  list: async (params) => {
    const { data } = await api.get("/oxygen", { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/oxygen/add", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/oxygen/update/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/oxygen/${id}`);
    return data;
  },
};
