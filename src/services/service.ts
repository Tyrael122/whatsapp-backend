import { users } from "../models/constants";
import {
  ChatDTO,
  ChatListRequest,
  ChatListResponse,
  GetChatMessagesRequest,
  IncomingMessages,
  MessageDTO,
  OutgoingEventType,
  SendMessageRequest,
} from "../models/dtos";
import { Chat } from "../models/model";

const chats = new Map<string, Chat>();

export function fetchChatList(data: ChatListRequest): ChatListResponse {
  const currentUser = users.find((user) => user.id === data.userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  const otherUsersChat = users
    .filter((user) => user.id !== data.userId)
    .map((user) => {
      return {
        id: [user.id, currentUser.id].sort().join("-"),
        users: [user, currentUser],
        name: user.name,
        isGroup: false,
        avatarSrc: user.avatarSrc,
        messages: [],
      };
    });

  const chatsWithLastMessage = otherUsersChat
    .map((chat) => {
      const storedChat = getChatById(chat.id);
      if (!storedChat) {
        chats.set(chat.id, chat);
        return chat;
      }

      return { ...chat, messages: storedChat.messages };
    })
    .map((chat) => {
      return {
        ...(chat as ChatDTO),
        lastMessage: chat.messages[chat.messages.length - 1],
      };
    })
    .sort((a, b) => {
      if (!a.lastMessage) {
        return 1;
      }

      if (!b.lastMessage) {
        return -1;
      }

      return (
        new Date(b.lastMessage.timestamp).getTime() -
        new Date(a.lastMessage.timestamp).getTime()
      );
    });

  return {
    type: OutgoingEventType.CHAT_LIST_RESPONSE,
    chats: chatsWithLastMessage,
  };
}

export function getChatMessages(
  data: GetChatMessagesRequest
): IncomingMessages {
  let chat = getChatById(data.chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  const messages = chat.messages;

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
    id: chat.messages.length,
    chatId: chat.id,
    from: data.from,
    text: data.message,
    timestamp: new Date().toISOString(),
  };

  chat.messages.push(message);

  const incomingMessageEvent = {
    type: OutgoingEventType.INCOMING_MESSAGES,
    messages: [message],
  };

  broadcastEvent(JSON.stringify(incomingMessageEvent));
}

function getChatById(chatId: string) {
  return chats.get(chatId);
}
