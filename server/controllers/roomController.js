import redis from '../redis/redisClient.js';
import { sortPlayersByProgress } from '../utils/helpers.js';

const ROOM_TTL = 60 * 15;

export const createRoom = async (io, socket, { roomId, userId, username }, callback) => {
  try {
    socket.join(roomId);
    const playerData = { username, wpm: 0, progress: 0, isLeader: true };
    
    await redis.hset(`room:${roomId}`, { [userId]: playerData });
    await redis.set(`room:${roomId}:leader`, userId);
    await redis.set(`user:${userId}:socket`, socket.id);
    await redis.expire(`room:${roomId}`, ROOM_TTL);

    const players = await redis.hgetall(`room:${roomId}`);
    io.to(roomId).emit("roomUpdate", sortPlayersByProgress(players));
    
    if (callback) {
      console.log("Room Created with Room ID:", roomId);
      callback({ success: true });
    }
  } catch (err) {
    console.error("Error creating room:", err);
    if (callback) {
      callback({ success: false, message: "Failed to create room" });
    }
  }
};

export const joinRoom = async (io, socket, { roomId, userId, username }) => {
  const exists = await redis.exists(`room:${roomId}`);

  if (!exists) 
    return socket.emit('error', 'Room not found');

  socket.join(roomId);
  await redis.set(`user:${userId}:socket`, socket.id);
  const playerExists = await redis.hexists(`room:${roomId}`, userId);
  
  if (!playerExists) {
    const playerData = { 
      username, 
      wpm: 0, 
      progress: 0,
      isLeader: false
    };
    await redis.hset(`room:${roomId}`, { [userId]: playerData });
  }

  const history = await redis.lrange(`room:${roomId}:messages`, 0, -1);
  const players = await redis.hgetall(`room:${roomId}`);

  socket.emit('chatHistory', history);
  io.to(roomId).emit("roomUpdate", sortPlayersByProgress(players));
};

export const leaveRoom = async (io, socket, { roomId, userId }) => {
  try {
    await redis.hdel(`room:${roomId}`, userId);    
    await redis.del(`user:${userId}:socket`);    
    const players = await redis.hgetall(`room:${roomId}`) || [];
    if (players.length === 0) {
      await redis.del(`room:${roomId}`);
      await redis.del(`room:${roomId}:leader`);
      await redis.del(`room:${roomId}:messages`);
    } else {
      io.to(roomId).emit("roomUpdate", sortPlayersByProgress(players));
    }
  } catch (err) {
    console.error("Error leaving room:", err);
  }
};

export const startTest = async (io, socket, { roomId, userId }) => {
  const leaderId = await redis.get(`room:${roomId}:leader`);
  if (leaderId !== userId) return;
  io.to(roomId).emit("testStarted");
};

export const updateStats = async (io, socket, { roomId, userId, wpm, progress }) => {
  const playerData = await redis.hget(`room:${roomId}`, userId);
  if (!playerData) return;
  playerData.wpm = wpm;
  playerData.progress = progress;
  await redis.hset(`room:${roomId}`, { [userId] : playerData });
  const players = await redis.hgetall(`room:${roomId}`);
  const db = players.map(p => p);
  console.log(db);

  io.to(roomId).emit("liveStats", sortPlayersByProgress(players));
};

export const chatMessage = async (io, socket, { roomId, userId, message }) => {
  try {
    const playerData = await redis.hget(`room:${roomId}`, userId);
    if (!playerData) return;
    
    const { username } = playerData;
    const cleanMessage = message;
    const messageData = {
      userId,
      username,
      message: cleanMessage,
      timestamp: Date.now()
    };

    io.to(roomId).emit("chatMessage", messageData);
    await redis.rpush(`room:${roomId}:messages`, messageData);
    await redis.ltrim(`room:${roomId}:messages`, 0, 20);


  } catch (err) {
    console.error("Error handling chat message:", err);
  }
};

export const endTest = async (io, socket, { roomId }) => {
  io.to(roomId).emit("testEnded");
};

export const disconnect = async (io, socket) => {
  // Optional cleanup logic
  console.log(`Socket disconnected: ${socket.id}`);
};