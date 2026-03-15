import { useEffect, useRef, useCallback } from 'react';
import type { ConnectionStatus } from '@/types';

interface UseWebSocketOptions {
  userId?: string | number;
  onSensorData?: (data: any) => void;
  onAlert?: (alert: any) => void;
  onAlertResolved?: (data: { alertId: string }) => void;
  onDeviceRegistered?: () => void;
  onDeviceDeleted?: (data: { deviceId: string }) => void;
}

// Simplified WebSocket hook - uses polling instead of socket.io
// Can be upgraded to Supabase Realtime later
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const connectionStatus: ConnectionStatus = { type: 'polling' };

  return { 
    connectionStatus,
    on: (_event: string, _handler: (...args: unknown[]) => void) => {
      return () => {};
    },
    emit: (_event: string, _data?: unknown) => {},
  };
}

export default useWebSocket;
