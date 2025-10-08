// ~/ems-sos/backend/src/socket.js
import { Server } from "socket.io";

export const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: { origin: "*" }, // WARNING: Restrict this in production!
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join:agency", (payload) => {
      console.log(`Socket ${socket.id} joined agency room: ${payload.agencyId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
  
  return io;
};