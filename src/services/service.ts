import { users } from "../models/constants";
import {
  ChatDTO,
  ChatListRequest,
  ChatListResponse,
  CreateGroupChatRequest,
  GetChatMessagesRequest,
  IncomingMessages,
  MessageDTO,
  OutgoingEventType,
  SendMessageRequest,
} from "../models/dtos";
import { Chat } from "../models/model";
import { sendMessageToUser } from "../websocket/websocketHandler";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const chats = new Map<string, Chat>();

export function createGroupChat(data: CreateGroupChatRequest) {
  const chat: Chat = {
    id: `group-${chats.size + 1}`,
    name: data.name,
    isGroup: true,
    users: data.userIds.map((userId) => {
      const user = users.find((user) => user.id === userId);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),
    avatarSrc: data.avatarSrc ? data.avatarSrc : undefined,
    createdAt: new Date().toISOString(),
    messages: [],
  };

  chats.set(chat.id, chat);

  for (const userId of data.userIds) {
    sendMessageToUser(userId, fetchChatList({ userId }));
  }
}

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
        createdAt: new Date().toISOString(),
        messages: [],
      };
    });

  const groupChats = Array.from(chats.values())
    .filter((chat) => chat.isGroup)
    .filter((chat) => {
      return chat.users.some((user) => user.id === currentUser.id);
    });

  const allChats: Chat[] = [...otherUsersChat, ...groupChats];

  const chatsWithLastMessage = allChats
    .map((chat) => {
      const storedChat = getChatById(chat.id);
      if (!storedChat) {
        chats.set(chat.id, chat);
        return chat;
      }

      return {
        ...chat,
        messages: storedChat.messages,
        createdAt: storedChat.createdAt,
      };
    })
    .map((chat) => {
      return {
        ...chat,
        lastMessage: chat.messages[chat.messages.length - 1],
      };
    })
    .sort((a, b) => {
      return compareDateStrings(a.createdAt, b.createdAt);
    })
    .sort((a, b) => {
      if (!a.lastMessage) {
        return 1;
      }

      if (!b.lastMessage) {
        return -1;
      }

      return compareDateStrings(
        a.lastMessage.timestamp,
        b.lastMessage.timestamp
      );
    });

  return {
    type: OutgoingEventType.CHAT_LIST_RESPONSE,
    chats: chatsWithLastMessage as ChatDTO[],
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

export async function sendMessage(data: SendMessageRequest) {
  const chat = getChatById(data.chatId);
  if (!chat) {
    return { error: "Chat not found" };
  }

  const message: MessageDTO = {
    id: chat.messages.length,
    chatId: chat.id,
    from: data.from,
    isAudio: data.isAudio,
    message: data.message,
    timestamp: new Date().toISOString(),
  };

  console.log(
    "Audio duration: ",
    data.isAudio
      ? await getDurationFromAudio(data.message)
      : "Not an audio message"
  );

  chat.messages.push(message);

  const incomingMessageEvent = {
    type: OutgoingEventType.INCOMING_MESSAGES,
    messages: [message],
  };

  const chatUsers = chat.users.map((user) => user.id);
  for (const userId of chatUsers) {
    sendMessageToUser(userId, incomingMessageEvent);
  }
}

export function getAllUsers() {
  return { type: OutgoingEventType.ALL_USERS_RESPONSE, users };
}

function getChatById(chatId: string) {
  return chats.get(chatId);
}

function compareDateStrings(date1: string, date2: string) {
  return new Date(date2).getTime() - new Date(date1).getTime();
}

function getDurationFromAudio(base64Audio: string) {
  return new Promise((resolve, reject) => {
    const audioBuffer = Buffer.from(base64Audio.split(",")[1], "base64"); // Extract the base64 data

    // Write the buffer to a temporary file
    const tempFilePath = `temp_audio_${Date.now()}.ogg`;
    fs.writeFileSync(tempFilePath, audioBuffer);

    ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
      // Cleanup the temporary file
      fs.unlinkSync(tempFilePath);

      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration);
      console.log("Duration:", metadata.format.duration);
    });
  });
}
