export interface User {
  id: string;
  name: string;
  avatarSrc: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  users: User[];
  avatarSrc?: string;
  createdAt: string;
  messages: Message[];
}

export interface Message {
  id: number;
  chatId: string;
  from: string;
  message: string;
  timestamp: string;
  isAudio: boolean;
}
