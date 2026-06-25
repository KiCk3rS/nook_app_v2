import type {
  GuideChatMessagesResponse,
  SendGuideChatMessagePayload,
  SendGuideChatMessageResponse,
} from '../../types/guideChat';
import { apiRequest } from './client';

export function fetchGuideChatMessages(poiId: string): Promise<GuideChatMessagesResponse> {
  return apiRequest<GuideChatMessagesResponse>(`/me/pois/${poiId}/guide-chat/messages`, {
    auth: true,
  });
}

export function sendGuideChatMessage(
  poiId: string,
  payload: SendGuideChatMessagePayload,
): Promise<SendGuideChatMessageResponse> {
  return apiRequest<SendGuideChatMessageResponse>(`/me/pois/${poiId}/guide-chat/messages`, {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
