"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// The simple shape of our messages
export interface WebSocketMessage {
  action: string;
  payload: any;
}

export function useWebSocket(onMessageReceived?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Keep the latest callback in a ref so we don't trigger reconnects
  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    let isMounted = true;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      // Don't connect if the component has unmounted
      if (!isMounted) return;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("🟢 Connected to Kardify WebSocket server!");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error("Error reading WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        console.log("🔴 Disconnected from WebSocket. Reconnecting in 3 seconds...");
        setIsConnected(false);
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    }

    connect();

    // Clean up when leaving the page
    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Don't trigger reconnect
        wsRef.current.close();
      }
    };
  }, []);

  // Simple function to send an action and data to other users
  const sendMessage = useCallback((action: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, payload }));
      console.log("Action: ",action);
      console.log("Payload: ",payload);
    }
  }, []);

  return { isConnected, sendMessage };
}
