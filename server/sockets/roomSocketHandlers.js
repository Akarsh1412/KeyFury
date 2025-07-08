import { createRoom, joinRoom, startTest, updateStats, disconnect, chatMessage, leaveRoom, endTest } from '../controllers/roomController.js';

const roomSocketHandlers = (io, socket) => {
  socket.on("createRoom", (data, callback) => createRoom(io, socket, data, callback));
  socket.on("joinRoom", (data) => joinRoom(io, socket, data));
  socket.on("leaveRoom", (data) => leaveRoom(io, socket, data));
  socket.on("chatMessage", (data) => chatMessage(io, socket, data));
  socket.on("startTest", (data) => startTest(io, socket, data));
  socket.on("endTest", (data) => endTest(io, socket, data));
  socket.on("updateStats", (data) => updateStats(io, socket, data));
  socket.on("disconnect", () => disconnect(io, socket));
};

export default roomSocketHandlers;
