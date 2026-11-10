import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io;

// Same allowed websites as app.js (set CLIENT_URL on the host; several can be comma-separated).
const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);

/** Creates the Socket.IO server on top of the HTTP server. */
export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: allowedOrigins } });
  io.on('connection', (socket) => {
    console.log(`⚡ client connected: ${socket.id}`);
  });
  return io;
}

/** Broadcasts an event to every connected dashboard. Safe to call before init (no-op). */
export function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}