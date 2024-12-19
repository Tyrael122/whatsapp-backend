import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import { setupWebSocket } from './websocket/websocketHandler';

const PORT = 8080;

// Create an HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ server });
setupWebSocket(wss); // Use the modular handler

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready on ws://localhost:${PORT}`);
});
