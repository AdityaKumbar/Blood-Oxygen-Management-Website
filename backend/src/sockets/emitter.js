export const emitSocketEvent = (req, eventName, payload) => {
  const io = req.app.get("io");
  if (!io) return;
  io.emit(eventName, payload);
};
