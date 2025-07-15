import redis from "../redis/redisClient.js";
import { addActiveRoom, removeActiveRoom } from "../server.js";
import { sortPlayersByWpm } from "../utils/helpers.js";

export const TEST_DURATION_SECONDS = 140;

export const ROOM_TTL = 60 * 15; // 15 minutes
export const USER_SOCKET_TTL = 60 * 25; // 25 minutes
export const CHAT_TTL = 60 * 20; // 20 minutes
export const TEST_DATA_TTL = 60 * 20; // 20 minutes

const addSocketMapping = (socket, userId, roomId) => {
  const key = `socket:${socket.id}`;
  const value = { userId, roomId };
  return redis.set(key, value, { ex: USER_SOCKET_TTL });
};

export const createRoom = async (
  io,
  socket,
  { roomId, userId, username },
  callback
) => {
  try {
    await socket.join(roomId);

    const playerData = {
      username,
      wpm: 0,
      progress: 0,
      accuracy: 100,
      isLeader: true,
      finished: false,
      performanceHistory: [],
    };

    const pipeline = redis.pipeline();
    pipeline.hset(`room:${roomId}`, { [userId]: playerData });
    pipeline.expire(`room:${roomId}`, ROOM_TTL);
    pipeline.set(`room:${roomId}:leader`, userId, { ex: ROOM_TTL });
    await pipeline.exec();

    await addSocketMapping(socket, userId, roomId);

    const playersData = await redis.hgetall(`room:${roomId}`);
    io.to(roomId).emit("roomUpdate", sortPlayersByWpm(playersData));

    if (callback) callback({ success: true });
    // console.log("Room Created with Room ID:", roomId);
  } catch (err) {
    console.error("Error creating room:", err);
    if (callback)
      callback({ success: false, message: "Failed to create room" });
  }
};

export const joinRoom = async (io, socket, { roomId, userId, username }) => {
  try {
    const exists = await redis.exists(`room:${roomId}`);
    if (!exists) return socket.emit("error", "Room not found");

    await socket.join(roomId);
    await addSocketMapping(socket, userId, roomId);

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

    const [history, playersData] = await Promise.all([
      redis.lrange(`room:${roomId}:messages`, 0, -1),
      redis.hgetall(`room:${roomId}`),
    ]);

    socket.emit("chatHistory", history);
    io.to(roomId).emit("roomUpdate", sortPlayersByWpm(playersData));
  } catch (err) {
    console.error("Error joining room:", err);
    socket.emit("error", "Failed to join room");
  }
};

export const leaveRoom = async (io, socket, { roomId, userId }) => {
  try {
    const roomExists = await redis.exists(`room:${roomId}`);
    if (!roomExists) return;

    const currentLeaderId = await redis.get(`room:${roomId}:leader`);
    const wasLeader = currentLeaderId === userId;

    await redis.hdel(`room:${roomId}`, userId);
    await redis.del(`socket:${socket.id}`);

    let playersData = await redis.hgetall(`room:${roomId}`) || {};
    const remainingPlayerIds = Object.keys(playersData);

    if (remainingPlayerIds.length === 0) {
      const cleanupPipeline = redis.pipeline();
      cleanupPipeline.del(`room:${roomId}`);
      cleanupPipeline.del(`room:${roomId}:leader`);
      cleanupPipeline.del(`room:${roomId}:messages`);
      cleanupPipeline.del(`room:${roomId}:testStartTime`);
      await cleanupPipeline.exec();
      removeActiveRoom(roomId);
    } else {
      if (wasLeader) {
        const newLeaderId = remainingPlayerIds[0];
        const newLeaderData = JSON.parse(playersData[newLeaderId]);
        newLeaderData.isLeader = true;
        
        const roomTtl = await redis.ttl(`room:${roomId}`);
        const pipeline = redis.pipeline();

        if (roomTtl > 0) {
          pipeline.set(`room:${roomId}:leader`, newLeaderId, { ex: roomTtl });
        } else {
          pipeline.set(`room:${roomId}:leader`, newLeaderId);
        }
        pipeline.hset(`room:${roomId}`, { [newLeaderId]: JSON.stringify(newLeaderData) });
        await pipeline.exec();

        playersData = await redis.hgetall(`room:${roomId}`);
      }
      io.to(roomId).emit("roomUpdate", sortPlayersByWpm(playersData));
    }
  } catch (err) {
    console.error("Error in leaveRoom:", err);
  }
};

export const updateStats = async (
  io,
  socket,
  { roomId, userId, wpm, progress, accuracy }
) => {
  try {
    const playerDataStr = await redis.hget(`room:${roomId}`, userId);
    if (!playerDataStr) return;
    const playerData = playerDataStr;

    if (playerData.finished) return;

    const testStartTime = await redis.get(`room:${roomId}:testStartTime`);
    if (!testStartTime) return;

    const timeElapsed = Math.floor(
      (Date.now() - parseInt(testStartTime)) / 1000
    );

    playerData.wpm = wpm;
    playerData.progress = progress;
    playerData.accuracy = accuracy;

    playerData.performanceHistory.push({
      time: timeElapsed,
      wpm,
      progress,
      accuracy,
    });

    if (progress >= 100) {
      playerData.finished = true;
      playerData.finishTime = timeElapsed;
    }

    await redis.hset(`room:${roomId}`, { [userId]: playerData });

    const updatedPlayersData = await redis.hgetall(`room:${roomId}`);
    const playersList = Object.values(updatedPlayersData);
    const allFinished = playersList.every((p) => p.finished);

    if (allFinished) {
      io.to(roomId).emit("testEnded", { reason: "all_finished" });
      removeActiveRoom(roomId);
      await redis.del(`room:${roomId}:testStartTime`);
    } else {
      io.to(roomId).emit("liveStats", sortPlayersByWpm(updatedPlayersData));
      if (playerData.finished) {
        socket.emit("playerFinished", { message: "You finished!" });
      }
    }
  } catch (err) {
    console.error("Error updating stats:", err);
  }
};

export const chatMessage = async (io, socket, { roomId, userId, message }) => {
  try {
    const playerData = await redis.hget(`room:${roomId}`, userId);
    if (!playerData) return;

    const { username } = playerData;
    const messageData = { userId, username, message, timestamp: Date.now() };

    io.to(roomId).emit("chatMessage", messageData);

    const pipeline = redis.pipeline();
    pipeline.rpush(`room:${roomId}:messages`, JSON.stringify(messageData));
    pipeline.expire(`room:${roomId}:messages`, CHAT_TTL);
    pipeline.ltrim(`room:${roomId}:messages`, -50, -1);
    await pipeline.exec();
  } catch (err) {
    console.error("Error handling chat message:", err);
  }
};

export const disconnect = async (io, socket) => {
  // console.log(`Socket disconnected: ${socket.id}`);
  try {
    await redis.del(`socket:${socket.id}`);
  } catch (err) {
    console.error("Error cleaning up on disconnect:", err);
  }
};

export const startTest = async (io, socket, { roomId, userId }) => {
  try {
    const playersDataObject = await redis.hgetall(`room:${roomId}`);
    if (!playersDataObject) return;

    const pipeline = redis.pipeline();
    for (const pId in playersDataObject) {
      const player = playersDataObject[pId];
      player.wpm = 0;
      player.progress = 0;
      player.accuracy = 100;
      player.finished = false;
      player.finishTime = null;
      player.performanceHistory = [];
      pipeline.hset(`room:${roomId}`, { [pId]: JSON.stringify(player) });
    }
    await pipeline.exec();

    addActiveRoom(roomId);
    io.to(roomId).emit("gameStarting", { countdown: 5 });
    let countdown = 5;

    const countdownInterval = setInterval(async () => {
      countdown--;
      if (countdown > 0) {
        io.to(roomId).emit("countdownUpdate", { countdown });
      } else {
        clearInterval(countdownInterval);

        const startTime = Date.now();
        await redis.set(`room:${roomId}:testStartTime`, startTime, {
          ex: TEST_DATA_TTL,
        });

        io.to(roomId).emit("testStarted", { startTime });
        setTimeout(async () => {
          const currentStartTime = await redis.get(
            `room:${roomId}:testStartTime`
          );
          if (String(currentStartTime) === String(startTime)) {
            io.to(roomId).emit("testEnded", { reason: "time_up" });
            removeActiveRoom(roomId);
            await redis.del(`room:${roomId}:testStartTime`);
          }
        }, (TEST_DURATION_SECONDS + 2) * 1000);
      }
    }, 1000);
  } catch (err) {
    console.error("Error starting test:", err);
  }
};

export const broadcastTimerSync = async (io, roomId) => {
  try {
    const roomExists = await redis.exists(`room:${roomId}`);
    if (!roomExists) return removeActiveRoom(roomId);

    const testStartTime = await redis.get(`room:${roomId}:testStartTime`);
    if (!testStartTime) return removeActiveRoom(roomId);

    const timeElapsed = Math.floor(
      (Date.now() - parseInt(testStartTime)) / 1000
    );
    const timeLeft = Math.max(0, TEST_DURATION_SECONDS - timeElapsed);

    if (timeLeft > 0) {
      io.to(roomId).emit("timerSync", {
        timeLeft,
        isRunning: true,
        serverTime: Date.now(),
      });
    } else {
      removeActiveRoom(roomId);
    }
  } catch (err) {
    console.error(`Error broadcasting timer sync for room ${roomId}:`, err);
    removeActiveRoom(roomId);
  }
};

export const getTimerSync = async (io, socket, { roomId }) => {
  try {
    const testStartTime = await redis.get(`room:${roomId}:testStartTime`);
    if (!testStartTime) {
      return socket.emit("timerSync", {
        timeLeft: TEST_DURATION_SECONDS,
        isRunning: false,
      });
    }
    const timeElapsed = Math.floor(
      (Date.now() - parseInt(testStartTime)) / 1000
    );
    const timeLeft = Math.max(0, TEST_DURATION_SECONDS - timeElapsed);
    socket.emit("timerSync", {
      timeLeft,
      isRunning: timeLeft > 0,
      serverTime: Date.now(),
    });
  } catch (err) {
    console.error("Error syncing timer:", err);
  }
};

export const endTest = async (io, socket, { roomId }) => {
  io.to(roomId).emit("testEnded", { reason: "manual_end" });
  removeActiveRoom(roomId);
  await redis.del(`room:${roomId}:testStartTime`);
};

export const handleGetResults = async (req, res) => {
  try {
    const { roomId } = req.params;
    const playersDataObject = await redis.hgetall(`room:${roomId}`);

    if (!playersDataObject || Object.keys(playersDataObject).length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const playersList = Object.entries(playersDataObject).map(
      ([userId, player]) => ({
        userId,
        username: player.username,
        finalWpm: player.wpm,
        finalAccuracy: player.accuracy,
        finalProgress: player.progress,
        finished: player.finished,
        finishTime: player.finishTime,
        performanceHistory: player.performanceHistory || [],
      })
    );

    res.json({ players: playersList });
  } catch (err) {
    console.error("Error getting results via API:", err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};