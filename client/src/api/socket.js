import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
let socket = null;

export const getSocket = () => {
  if (!socket) socket = io(URL, { autoConnect: false, reconnectionAttempts: 5 });
  return socket;
};
export const connectSocket = () => { const s = getSocket(); if (!s.connected) s.connect(); return s; };
export const disconnectSocket = () => { if (socket?.connected) socket.disconnect(); };
