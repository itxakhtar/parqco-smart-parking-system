import { io } from 'socket.io-client';
import { API_URL } from './client.js';

// Shared real-time connection to the backend (live slot updates).
// Empty URL = same origin, which the Vite dev server proxies to the backend.
export const socket = io(API_URL || undefined, { autoConnect: true });
