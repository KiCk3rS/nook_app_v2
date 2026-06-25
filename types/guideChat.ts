export type GuideChatRole = 'user' | 'assistant';

export interface GuideChatMessage {
  id: string;
  role: GuideChatRole;
  content: string;
  createdAt: string;
}

export interface GuideChatMessagesResponse {
  messages: GuideChatMessage[];
  creditsBalance?: number;
}

export interface SendGuideChatMessagePayload {
  content: string;
}

export interface SendGuideChatMessageResponse {
  userMessage: GuideChatMessage;
  assistantMessage: GuideChatMessage;
  creditsBalance?: number;
}
