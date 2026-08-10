import { io } from "socket.io-client";
import { REALTIME_ENABLED, SOCKET_URL } from "./config";

let socket = null;

export const getSocket = () => {
  if (!REALTIME_ENABLED) return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      withCredentials: true,
    });
  }
  return socket;
};
export const connectSocket = () => { const s = getSocket(); if (s && !s.connected) s.connect(); return s; };
export const disconnectSocket = () => { if (socket?.connected) socket.disconnect(); };
