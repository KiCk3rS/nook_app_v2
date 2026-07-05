import { ApiError } from '../../types/api';
import type {
  GuideChatMessage,
  GuideChatMessagesResponse,
  SendGuideChatMessageResponse,
} from '../../types/guideChat';

export type GuideChatErrorCode =
  | 'network'
  | 'unauthorized'
  | 'insufficient_credits'
  | 'no_sources'
  | 'rate_limited'
  | 'unknown';

interface GuideChatCreditsApi {
  balance: number;
  charged: number;
}

export interface GuideChatMessagesApiResponse {
  items: GuideChatMessage[];
  total: number;
  limit: number;
  offset: number;
  credits: GuideChatCreditsApi;
}

export interface SendGuideChatMessageApiResponse {
  userMessage: GuideChatMessage;
  assistantMessage: GuideChatMessage;
  credits: GuideChatCreditsApi;
}

export function mapGuideChatMessagesResponse(
  api: GuideChatMessagesApiResponse,
): GuideChatMessagesResponse {
  return {
    messages: api.items,
    creditsBalance: api.credits.balance,
  };
}

export function mapSendGuideChatMessageResponse(
  api: SendGuideChatMessageApiResponse,
): SendGuideChatMessageResponse {
  return {
    userMessage: api.userMessage,
    assistantMessage: api.assistantMessage,
    creditsBalance: api.credits.balance,
  };
}

export function resolveGuideChatErrorCode(error: unknown): GuideChatErrorCode {
  if (!(error instanceof ApiError)) {
    return 'network';
  }
  if (error.statusCode === 401) return 'unauthorized';
  if (
    error.statusCode === 402 ||
    error.code === 'GUIDE_CHAT_INSUFFICIENT_CREDITS'
  ) {
    return 'insufficient_credits';
  }
  if (error.statusCode === 422 && error.code === 'GUIDE_CHAT_NO_SOURCES') {
    return 'no_sources';
  }
  if (error.statusCode === 429) return 'rate_limited';
  return 'unknown';
}
