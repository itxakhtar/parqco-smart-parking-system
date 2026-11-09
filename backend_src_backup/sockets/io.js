import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io;

/** Creates the Socket.IO server on top of the HTTP server. */
export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: env.clientUrl } });
  io.on('connection', (socket) => {
    console.log(`⚡ client connected: ${socket.id}`);
  });
  return io;
}

/** Broadcasts an event to every connected dashboard. Safe to call before init (no-op). */
export function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}
