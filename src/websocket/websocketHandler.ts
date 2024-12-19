import { WebSocketServer } from 'ws';
import { handleClientMessage, handleConnectionClose } from '../controllers/websocketController';

export const setupWebSocket = (wss: WebSocketServer) => {
  function broadcastEvent(event: any) {
    wss.clients.forEach((client) => {
      client.send(event);
    });
  }

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Handle incoming messages
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
      handleClientMessage(broadcastEvent, ws, message); // Delegate to controller
    });

    // Handle disconnection
    ws.on('close', () => {
      handleConnectionClose(ws);
    });

    // Optionally send a welcome message
    // ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
  });
};