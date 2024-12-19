import { users } from "../models/constants";
import {
  ChatListRequest,
  ChatListResponse,
  GetChatMessagesRequest,
  MessageDTO,
  OutgoingEventType,
  SendMessageRequest,
} from "../models/dtos";
import { Chat } from "../models/model";

const chats = initializeHardcodedChats();

function initializeHardcodedChats(): Map<Chat, MessageDTO[]> {
  const chats = new Map<Chat, MessageDTO[]>();

  users.forEach((user) => {
    const chat: Chat = {
      id: user.id,
      users: [], // TODO: Add users
      name: user.name,
      isGroup: false,
      avatarSrc: user.avatarSrc,
    };

    chats.set(chat, []);
  });

  return chats;
}

export function fetchChatList(data: ChatListRequest): ChatListResponse {
  const chatsArray = Array.from(chats.keys())
    .filter((chat) => {
      return chat.id !== data.userId;
    })
    .map((chat) => {
      return {
        ...chat,
        lastMessage: chats.get(chat)?.[0],
      };
    });

  return { type: OutgoingEventType.CHAT_LIST_RESPONSE, chats: chatsArray };
}

export function getChatMessages(data: GetChatMessagesRequest) {
  const chat = getChatById(data.chatId);

  if (!chat) {
    return { error: "Chat not found" };
  }

  const messages = chats.get(chat) || [];

  return { type: OutgoingEventType.INCOMING_MESSAGES, messages };
}

export function sendMessage(
  data: SendMessageRequest,
  broadcastEvent: (event: string) => void
) {
  const chat = getChatById(data.chatId);
  if (!chat) {
    return { error: "Chat not found" };
  }

  const message: MessageDTO = {
    id: chats.get(chat)?.length || 0,
    chatId: chat.id,
    from: data.from,
    text: data.message,
    timestamp: new Date().toISOString(),
  };

  chats.get(chat)?.push(message);

  const incomingMessageEvent = {
    type: OutgoingEventType.INCOMING_MESSAGES,
    messages: [message],
  };

  broadcastEvent(JSON.stringify(incomingMessageEvent));
}

function getChatById(chatId: string) {
  return Array.from(chats.keys()).find((chat) => {
    return chat.id === chatId;
  });
}
