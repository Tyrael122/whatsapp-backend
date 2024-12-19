export interface IncomingWhatsAppEvent {
  type: IncomingEventType;
}

export interface OutgoingWhatsAppEvent {
  type: OutgoingEventType;
}

export enum IncomingEventType {
  CHAT_LIST_REQUEST = "CHAT_LIST_REQUEST",
  GET_CHAT_MESSAGES = "GET_CHAT_MESSAGES",
  SEND_MESSAGE = "SEND_MESSAGE",
}

export enum OutgoingEventType {
  CHAT_LIST_RESPONSE = "CHAT_LIST_RESPONSE",
  INCOMING_MESSAGES = "INCOMING_MESSAGES",
}

export interface ChatListRequest extends IncomingWhatsAppEvent {
  userId?: string;
}

export interface GetChatMessagesRequest extends IncomingWhatsAppEvent {
  chatId: string;
}

export interface SendMessageRequest extends IncomingWhatsAppEvent {
  chatId: string;
  from: string;
  message: string;
}

export interface ChatListResponse extends OutgoingWhatsAppEvent {
  chats: ChatDTO[];
}

export interface IncomingMessages extends OutgoingWhatsAppEvent {
  messages: MessageDTO[];
}

export interface ChatDTO {
  id: string;
  name: string;
  isGroup: boolean;
  avatarSrc: string;
  lastMessage?: MessageDTO;
}

export interface MessageDTO {
  id: number;
  chatId: string;
  from: string;
  text: string;
  timestamp: string;
}
