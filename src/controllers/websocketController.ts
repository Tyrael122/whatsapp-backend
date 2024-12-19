import WebSocket from "ws";
import {
  fetchChatList,
  getChatMessages,
  sendMessage,
} from "../services/service";
import { IncomingEventType } from "../models/dtos";

export const handleClientMessage = (
  broadcastEvent: (event: any) => void,
  ws: WebSocket,
  message: WebSocket.RawData
) => {
  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    ws.send(JSON.stringify({ error: "Invalid JSON format" }));
    return;
  }

  console.log("Processing message:", data);

  // Handle specific message types
  if (handleSystemEventTypes(ws, data)) {
    return;
  }

  if (handleWhatsAppEventTypes(ws, data, broadcastEvent)) {
    return;
  }

  // Handle unknown message types

  ws.send(JSON.stringify({ error: "Unknown message type" }));
};

export const handleConnectionClose = (ws: WebSocket) => {
  console.log("Client disconnected");
  // Any cleanup logic if needed
};

function handleSystemEventTypes(ws: WebSocket, data: any) {
  if (data.type === "PING") {
    ws.send(JSON.stringify({ type: "PONG" }));
    return true;
  }

  return false;
}

function handleWhatsAppEventTypes(
  ws: WebSocket,
  data: any,
  broadcastEvent: (event: any) => void
) {
  if (data.type === IncomingEventType.CHAT_LIST_REQUEST) {
    ws.send(JSON.stringify(fetchChatList(data)));
    return true;
  }

  if (data.type === IncomingEventType.GET_CHAT_MESSAGES) {
    ws.send(JSON.stringify(getChatMessages(data)));
    return true;
  }

  if (data.type === IncomingEventType.SEND_MESSAGE) {
    sendMessage(data, broadcastEvent);
    return true;
  }

  return false;
}
