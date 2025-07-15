import express from 'express';
import dotenv from 'dotenv'
dotenv.config();

import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io'
import roomSocketHandlers from './sockets/roomSocketHandlers.js';
import { broadcastTimerSync, handleGetResults } from './controllers/roomController.js';
import redis from './redis/redisClient.js';

const PORT = process.env.PORT;

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: corsOptions
});

app.get('/api/results/:roomId', handleGetResults);

io.on('connection', (socket) => {
  roomSocketHandlers(io, socket);
});

const activeRooms = new Set();

export const addActiveRoom = (roomId) => {
  activeRooms.add(roomId);
  console.log(`Added room ${roomId} to active tracking. Total active: ${activeRooms.size}`);
};

export const removeActiveRoom = (roomId) => {
  const wasRemoved = activeRooms.delete(roomId);
  if (wasRemoved) {
    console.log(`Removed room ${roomId} from active tracking. Total active: ${activeRooms.size}`);
  }
};

// Validate and clean up activeRooms periodically
const validateActiveRooms = async () => {
  if (activeRooms.size === 0) return;
  
  const roomsToCheck = Array.from(activeRooms);
  const pipeline = redis.pipeline();
  
  // Check if rooms still exist and have active tests
  roomsToCheck.forEach(roomId => {
    pipeline.exists(`room:${roomId}`);
    pipeline.exists(`room:${roomId}:testStartTime`);
  });
  
  try {
    const results = await pipeline.exec();
    const roomsToRemove = [];
    
    for (let i = 0; i < roomsToCheck.length; i++) {
      const roomId = roomsToCheck[i];
      const roomExists = results[i * 2]; 
      const testExists = results[i * 2 + 1];
      // --- FIX ENDS HERE ---
      
      // Remove from active if room doesn't exist or test hasn't started/ended
      if (!roomExists || !testExists) {
        roomsToRemove.push(roomId);
      }
    }
    
    // Clean up invalid rooms
    roomsToRemove.forEach(roomId => {
      removeActiveRoom(roomId);
    });
    
    if (roomsToRemove.length > 0) {
      console.log(`Cleaned up ${roomsToRemove.length} invalid active rooms`);
    }
  } catch (error) {
    console.error('Error validating active rooms:', error);
  }
};

const startTimerSyncService = (io) => {
  setInterval(async () => {
    await validateActiveRooms();
    
    if (activeRooms.size === 0) return;
    
    const roomsToSync = Array.from(activeRooms);
    console.log(`Syncing timer for ${roomsToSync.length} active rooms`);
    
    for (const roomId of roomsToSync) {
      try {
        await broadcastTimerSync(io, roomId);
      } catch (error) {
        console.error(`Error syncing room ${roomId}:`, error);
        removeActiveRoom(roomId);
      }
    }
  }, 2000);
};

const startCleanupService = () => {
  setInterval(async () => {
    await validateActiveRooms();
    console.log(`Active rooms cleanup completed. Current active: ${activeRooms.size}`);
  }, 5 * 60 * 1000); // 5 minutes
};

startTimerSyncService(io);
startCleanupService();

app.get('/', (req, res) => {
  res.send('Hello From KeyFury Server!');
});

app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.json({
      status: 'healthy',
      activeRooms: activeRooms.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});