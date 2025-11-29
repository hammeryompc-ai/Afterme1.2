import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket = null

export const initSocket = () => {
  const { token } = useAuthStore.getState()
  
  if (!socket) {
    socket = io(window.location.origin, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })
  }
  
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const socketEvents = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Chat events
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  READ_RECEIPT: 'read:receipt',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // AI events
  AI_RESPONSE: 'ai:response',
  AI_TYPING: 'ai:typing'
}
