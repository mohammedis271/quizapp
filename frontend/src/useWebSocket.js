import { useState, useEffect, useCallback, useRef } from 'react';

export default function useWebSocket(url, onMessage) {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('connecting');
  const handlerRef = useRef(onMessage);

  useEffect(() => { handlerRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    const socket = new WebSocket(url);
    socket.onopen = () => setStatus('connected');
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Dispatch immediately so every message is processed (not just the last
        // one in a render batch).
        handlerRef.current?.(data);
      } catch (e) {
        console.error('Bad WS message', e);
      }
    };
    socket.onclose = () => setStatus('disconnected');
    socket.onerror = () => setStatus('disconnected');
    setWs(socket);
    return () => socket.close();
  }, [url]);

  const sendMessage = useCallback((data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [ws]);

  return { sendMessage, status };
}
