import { WebSocket, WebSocketServer } from "ws";
import {
  handleClientMessage,
  handleConnectionClose,
} from "../controllers/websocketController";

type WebSocketMessage = {
  id?: string; // Optional request ID for direct responses
};

const socketUserMap = new Map<string, WebSocket>();

export function sendMessageToUser(userId: string, data: any, id?: string) {
  const userSocket = socketUserMap.get(userId);
  if (!userSocket) {
    return;
  }

  sendMessage(userSocket, data, id);
}

function sendMessage(webSocket: WebSocket, data: any, id?: string) {
  const finalMessage = JSON.stringify({ ...data, id });

  console.log("Sending:", finalMessage);

  webSocket.send(finalMessage);
}


export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on("connection", (socket) => {
    console.log("New WebSocket connection established");

    // Handle incoming messages
    socket.on("message", (message) => {
      const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;

      handleClientMessage(
        (data) => sendMessage(socket, data, parsedMessage.id),
        (userId) => socketUserMap.set(userId, socket),
        parsedMessage
      ); // Delegate to controller
    });

    // Handle disconnection
    socket.on("close", () => {
      handleConnectionClose(socket);
    });
  });
};
