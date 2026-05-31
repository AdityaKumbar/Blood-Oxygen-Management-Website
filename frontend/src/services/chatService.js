import api from "./api";

export const assistantService = {
  chat: async ({ message, history = [] }) => {
    const { data } = await api.post("/assistant/chat", { message, history });
    return data.data;
  },
};
