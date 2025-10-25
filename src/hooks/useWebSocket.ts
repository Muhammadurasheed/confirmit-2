import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/constants';

interface UseWebSocketOptions {
  receiptId?: string;
  onProgress?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useWebSocket = ({ receiptId, onProgress, onComplete, onError }: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!receiptId || socketRef.current) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('join', receiptId);
    });

    socket.on('analysis_progress', (data) => {
      console.log('Progress update:', data);
      onProgress?.(data);
    });

    socket.on('analysis_complete', (data) => {
      console.log('Analysis complete:', data);
      onComplete?.(data);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current = socket;
  }, [receiptId, onProgress, onComplete, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connect, disconnect };
};
