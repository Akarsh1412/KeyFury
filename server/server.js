import express from 'express';
import dotenv from 'dotenv'
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io'
import roomSocketHandlers from './sockets/roomSocketHandlers.js';

const PORT = process.env.PORT;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
  roomSocketHandlers(io, socket);
});

app.get('/', (req, res) => {
  res.send('Hello From KeyFury Server!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});