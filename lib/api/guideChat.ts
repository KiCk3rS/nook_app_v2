import {
  mapGuideChatMessagesResponse,
  mapSendGuideChatMessageResponse,
  type GuideChatMessagesApiResponse,
  type SendGuideChatMessageApiResponse,
} from '../mappers/guideChat';
import type {
  GuideChatMessagesResponse,
  SendGuideChatMessagePayload,
  SendGuideChatMessageResponse,
} from '../../types/guideChat';
import { apiRequest } from './client';

export async function fetchGuideChatMessages(
  poiId: string,
): Promise<GuideChatMessagesResponse> {
  const api = await apiRequest<GuideChatMessagesApiResponse>(
    `/me/pois/${poiId}/guide-chat/messages`,
    { auth: true },
  );
  return mapGuideChatMessagesResponse(api);
}

export async function sendGuideChatMessage(
  poiId: string,
  payload: SendGuideChatMessagePayload,
): Promise<SendGuideChatMessageResponse> {
  const api = await apiRequest<SendGuideChatMessageApiResponse>(
    `/me/pois/${poiId}/guide-chat/messages`,
    {
      method: 'POST',
      auth: true,
      body: payload,
    },
  );
  return mapSendGuideChatMessageResponse(api);
}
