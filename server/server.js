import express from 'express';
import dotenv from 'dotenv'
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io'
import roomSocketHandlers from './sockets/roomSocketHandlers.js';
import { broadcastTimerSync } from './controllers/roomController.js';

const PORT = process.env.PORT;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

const activeRooms = new Set();

export const addActiveRoom = (roomId) => {
  activeRooms.add(roomId);
};

export const removeActiveRoom = (roomId) => {
  activeRooms.delete(roomId);
};

io.on('connection', (socket) => {
  roomSocketHandlers(io, socket);
});

const startTimerSyncService = (io) => {
  setInterval(async () => {
    if (activeRooms.size === 0) return;
    const roomsToSync = Array.from(activeRooms);
    
    for (const roomId of roomsToSync) {
      try {
        await broadcastTimerSync(io, roomId);
      } catch (error) {
        console.error(`Error syncing room ${roomId}:`, error);
        activeRooms.delete(roomId);
      }
    }
  }, 2000);
};

startTimerSyncService(io);

app.get('/', (req, res) => {
  res.send('Hello From KeyFury Server!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});