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
  messages: Message[];
}

export interface Message {
  id: number;
  chatId: string;
  from: string;
  text: string;
  timestamp: string;
}
