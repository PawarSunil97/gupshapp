import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "../../Env.js";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// STORE ONLINE USERS (userId → socketId)
const userSocketMap = {};  // must come BEFORE getReceiverSocketId

// GET RECEIVER SOCKET ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// AUTH MIDDLEWARE FOR SOCKETS
io.use(socketAuthMiddleware);

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("A user connected:", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Send updated online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // DISCONNECT HANDLER
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.user.fullName);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
