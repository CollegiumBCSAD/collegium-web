import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

function createSocket(): Socket {
  return io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}

export function getSocket(): Socket {
  if (!socket) {
    socket = createSocket();
  }
  return socket;
}

export function connectSocket(): Socket {
  const instance = getSocket();
  if (!instance.connected) {
    instance.connect();
  }
  return instance;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
