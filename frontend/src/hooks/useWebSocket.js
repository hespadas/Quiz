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
        console.info("[WebSocket] Conexão estabelecida.");
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Erro:", error);
        if (attempt < 5 && shouldReconnect) {
          setTimeout(() => connectWebSocket(attempt + 1), attempt * 1000);
        } else {
          toast.error(
            "Falha na conexão do WebSocket após múltiplas tentativas."
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error("[WebSocket] Erro ao parsear mensagem:", err);
        }
      };

      ws.onclose = () => {
        console.warn("[WebSocket] Conexão fechada.");
        if (shouldReconnect) {
          console.warn("Tentando reconectar...");
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
        console.error(
          "[WebSocket] Não foi possível enviar a mensagem: conexão não estabelecida."
        );
        toast.error("Conexão perdida. Reconectando...");
        connectWebSocket();
      }
    },
    [connectWebSocket]
  );

  return { sendMessage, socket: socketRef.current };
};

export default useWebSocket;
