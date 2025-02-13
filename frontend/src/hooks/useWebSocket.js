import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

const useWebSocket = (url, onMessage, shouldReconnect = true) => {
  const socketRef = useRef(null);

  const connectWebSocket = useCallback(
    (attempt = 1) => {
      if (!url || !shouldReconnect) return;

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        return;
      }

      const ws = new WebSocket(url);

      ws.onopen = () => {
        socketRef.current = ws;
        console.info("[WebSocket] Connection established.");
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Erro:", error);
        if (attempt < 5 && shouldReconnect) {
          setTimeout(() => connectWebSocket(attempt + 1), attempt * 1000);
        } else {
          toast.error("WebSocket connection failed after multiple attempts.");
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error("[WebSocket] Error parsing message:", err);
        }
      };

      ws.onclose = () => {
        if (shouldReconnect) {
          setTimeout(() => connectWebSocket(), 2000);
        }
      };
    },
    [url, onMessage, shouldReconnect]
  );

  useEffect(() => {
    if (!url) return;
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, connectWebSocket]);

  const sendMessage = useCallback(
    (message) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify(message));
      } else {
        toast.error("Connection lost. Reconnecting...");
        connectWebSocket();
      }
    },
    [connectWebSocket]
  );

  return { sendMessage, socket: socketRef.current };
};

export default useWebSocket;
