import { SOCKET_EVENTS } from "./events.js";

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.SUBSCRIBE_DASHBOARD, () => {
      socket.join("dashboard-room");
      socket.emit(SOCKET_EVENTS.DASHBOARD_SUBSCRIBED, { connected: true, socketId: socket.id });
    });

    socket.on("incident:update", (payload) => {
      socket.broadcast.emit("incident:updated", payload);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default registerSocketHandlers;
