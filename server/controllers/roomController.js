import redis from "../redis/redisClient.js";
import { sortPlayersByProgress } from "../utils/helpers.js";

const ROOM_TTL = 60 * 15;

export const createRoom = async (
  io,
  socket,
  { roomId, userId, username },
  callback
) => {
  try {
    socket.join(roomId);
    const playerData = {
      username,
      wpm: 0,
      progress: 0,
      accuracy: 100,
      isLeader: true,
      finished: false,
      performanceHistory: [],
    };

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

  if (!exists) return socket.emit("error", "Room not found");

  socket.join(roomId);
  await redis.set(`user:${userId}:socket`, socket.id);
  const playerExists = await redis.hexists(`room:${roomId}`, userId);

  if (!playerExists) {
    const playerData = {
      username,
      wpm: 0,
      progress: 0,
      accuracy: 100,
      isLeader: false,
      finished: false,
      performanceHistory: [],
    };
    await redis.hset(`room:${roomId}`, { [userId]: playerData });
  }

  const history = await redis.lrange(`room:${roomId}:messages`, 0, -1);
  const playersData = await redis.hgetall(`room:${roomId}`);

  socket.emit("chatHistory", history);
  io.to(roomId).emit("roomUpdate", sortPlayersByProgress(playersData));
};

export const leaveRoom = async (io, socket, { roomId, userId }) => {
  try {
    await redis.hdel(`room:${roomId}`, userId);
    await redis.del(`user:${userId}:socket`);
    const playersData = (await redis.hgetall(`room:${roomId}`)) || {};

    if (Object.keys(playersData).length === 0) {
      await redis.del(`room:${roomId}`);
      await redis.del(`room:${roomId}:leader`);
      await redis.del(`room:${roomId}:messages`);
      await redis.del(`room:${roomId}:testStartTime`);
    } else {
      io.to(roomId).emit("roomUpdate", sortPlayersByProgress(playersData));
    }
  } catch (err) {
    console.error("Error leaving room:", err);
  }
};

export const startTest = async (io, socket, { roomId, userId }) => {
  const leaderId = await redis.get(`room:${roomId}:leader`);
  if (leaderId !== userId) return;

  // Store test start time
  await redis.set(`room:${roomId}:testStartTime`, Date.now());

  io.to(roomId).emit("testStarted");
};

export const updateStats = async (
  io,
  socket,
  { roomId, userId, wpm, progress, accuracy }
) => {
  try {
    const playerData = await redis.hget(`room:${roomId}`, userId);
    if (!playerData) return;

    const testStartTime = await redis.get(`room:${roomId}:testStartTime`);
    const timeElapsed = testStartTime
      ? Math.floor((Date.now() - parseInt(testStartTime)) / 1000)
      : 0;

    // Update player stats
    playerData.wpm = wpm;
    playerData.progress = progress;
    playerData.accuracy = accuracy;

    // Add to performance history
    playerData.performanceHistory.push({
      time: timeElapsed,
      wpm,
      progress,
      accuracy,
    });

    // Check if player finished (100% progress)
    if (progress >= 100 && !playerData.finished) {
      playerData.finished = true;
      playerData.finishTime = timeElapsed;
    }

    await redis.hset(`room:${roomId}`, { [userId]: playerData });

    // Get all players to check completion status
    const playersData = await redis.hgetall(`room:${roomId}`);
    const players = Object.entries(playersData).map(([userId, playerData]) => {
      return {
        userId,
        ...playerData,
      };
    });

    // Check if all players have finished
    const allFinished = players.every((player) => player.finished);

    if (allFinished) {
      io.to(roomId).emit("testEnded", { reason: "all_finished" });
    } else {
      io.to(roomId).emit("liveStats", sortPlayersByProgress(players));

      if (playerData.finished) {
        io.to(socket.id).emit("playerFinished", {
          message: "You finished! Waiting for other players...",
        });
      }
    }
  } catch (err) {
    console.error("Error updating stats:", err);
  }
};

export const chatMessage = async (io, socket, { roomId, userId, message }) => {
  try {
    const playerDataStr = await redis.hget(`room:${roomId}`, userId);
    if (!playerDataStr) return;

    const playerData = JSON.parse(playerDataStr);
    const { username } = playerData;
    const cleanMessage = message;
    const messageData = {
      userId,
      username,
      message: cleanMessage,
      timestamp: Date.now(),
    };

    io.to(roomId).emit("chatMessage", messageData);
    await redis.rpush(`room:${roomId}:messages`, messageData);
    await redis.ltrim(`room:${roomId}:messages`, 0, 20);
  } catch (err) {
    console.error("Error handling chat message:", err);
  }
};

export const endTest = async (io, socket, { roomId }) => {
  io.to(roomId).emit("testEnded", { reason: "time_up" });
};

export const getResults = async (io, socket, { roomId }) => {
  try {
    const playersData = await redis.hgetall(`room:${roomId}`);

    const players = Object.entries(playersData).map(([userId, playerData]) => {
      return {
        userId,
        ...playerData,
      };
    });

    const results = {
      players: players.map((player) => ({
        userId: player.userId,
        username: player.username,
        finalWpm: player.wpm,
        finalAccuracy: player.accuracy,
        finalProgress: player.progress,
        finished: player.finished,
        finishTime: player.finishTime,
        performanceHistory: player.performanceHistory,
      })),
    };

    socket.emit("testResults", results);
  } catch (err) {
    console.error("Error getting results:", err);
  }
};

export const disconnect = async (io, socket) => {
  console.log(`Socket disconnected: ${socket.id}`);
};
