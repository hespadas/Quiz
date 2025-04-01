import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

const useWebSocket = (url, onMessage, shouldReconnect = true) => {
  const socketRef = useRef(null);
  const manuallyClosedRef = useRef(false);

  const closeSocket = useCallback(() => {
    manuallyClosedRef.current = true;
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout;
    let isMounted = true;

    const connect = () => {
      // Se não houver URL, se não deve reconectar ou se o fechamento foi manual, não conecta
      if (!url || !shouldReconnect || manuallyClosedRef.current || !isMounted)
        return;

      // Se já houver uma conexão aberta, não reconecta.
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
        console.error("[WebSocket] Error:", error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof onMessage === "function") {
            onMessage(data);
          }
        } catch (err) {
          console.error("[WebSocket] Error parsing message:", err);
        }
      };

      ws.onclose = () => {
        console.info("[WebSocket] Connection closed.");
        if (shouldReconnect && isMounted && !manuallyClosedRef.current) {
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [url, shouldReconnect, onMessage]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      toast.error("Connection lost. Reconnecting...");
    }
  }, []);

  return { sendMessage, socket: socketRef.current, closeSocket };
};

export default useWebSocket;
