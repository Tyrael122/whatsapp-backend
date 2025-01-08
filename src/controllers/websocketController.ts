import WebSocket from "ws";
import {
  createGroupChat,
  fetchChatList,
  getAllUsers,
  getChatMessages,
  sendMessage,
} from "../services/service";
import { IncomingEventType } from "../models/dtos";

export const handleClientMessage = (
  sendMessage: (data: any) => void,
  assignUserIdToConnection: (userId: string) => void,
  data: any
) => {
  console.log("Processing message:", data);

  if (handleWhatsAppEventTypes(sendMessage, data, assignUserIdToConnection)) {
    return;
  }

  sendMessage({ error: "Unknown message type" });
};

export const handleConnectionClose = (ws: WebSocket) => {
  console.log("Client disconnected");
  // Any cleanup logic if needed
};

function handleWhatsAppEventTypes(
  send: (data: any) => void,
  data: any,
  assignUserIdToConnection: (userId: string) => void
) {
  if (data.type === IncomingEventType.USER_ID_INFO) {
    // socketUserMap.set(data.userId, send);
    assignUserIdToConnection(data.userId);
    return true;
  }

  if (data.type === IncomingEventType.CHAT_LIST_REQUEST) {
    send(fetchChatList(data));
    return true;
  }

  if (data.type === IncomingEventType.GET_CHAT_MESSAGES) {
    send(getChatMessages(data));
    return true;
  }

  if (data.type === IncomingEventType.SEND_MESSAGE) {
    sendMessage(data);
    return true;
  }

  if (data.type === IncomingEventType.CREATE_GROUP_CHAT) {
    createGroupChat(data);
    return true;
  }

  if (data.type === IncomingEventType.GET_ALL_USERS) {
    send(getAllUsers());
    return true;
  }

  return false;
}
