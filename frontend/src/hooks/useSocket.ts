'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';

export function useSocket(): Socket | null {
  const user = useAuthStore((s) => s.user);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    socketRef.current = connectSocket(user._id);
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef.current;
}
