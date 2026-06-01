import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from './api-url';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), { transports: ['websocket', 'polling'], autoConnect: true });
  }
  return socket;
}
