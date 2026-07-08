import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore() as any;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Connected to WebSockets');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSockets');
        setIsConnected(false);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, token]);

  return { socket: socketRef.current, isConnected };
}
