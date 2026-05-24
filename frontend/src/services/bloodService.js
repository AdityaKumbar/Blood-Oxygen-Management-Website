import api from "./api";

export const bloodService = {
  list: async (params) => {
    const { data } = await api.get("/blood", { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/blood/add", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/blood/update/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/blood/${id}`);
    return data;
  },
};
