import { ApiError } from '../../../types/api';
import {
  mapGuideChatMessagesResponse,
  mapSendGuideChatMessageResponse,
  resolveGuideChatErrorCode,
} from '../../mappers/guideChat';

describe('mapGuideChatMessagesResponse', () => {
  it('extrait messages et credits.balance', () => {
    const mapped = mapGuideChatMessagesResponse({
      items: [
        {
          id: 'm-1',
          role: 'user',
          content: 'Bonjour',
          createdAt: '2026-07-05T10:00:00.000Z',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
      credits: { balance: 42, charged: 0 },
    });

    expect(mapped.messages).toHaveLength(1);
    expect(mapped.creditsBalance).toBe(42);
  });
});

describe('mapSendGuideChatMessageResponse', () => {
  it('extrait credits.balance après envoi', () => {
    const mapped = mapSendGuideChatMessageResponse({
      userMessage: {
        id: 'u-1',
        role: 'user',
        content: 'Question',
        createdAt: '2026-07-05T10:00:00.000Z',
      },
      assistantMessage: {
        id: 'a-1',
        role: 'assistant',
        content: 'Réponse',
        createdAt: '2026-07-05T10:00:01.000Z',
      },
      credits: { balance: 11, charged: 1 },
    });

    expect(mapped.creditsBalance).toBe(11);
    expect(mapped.assistantMessage.content).toBe('Réponse');
  });
});

describe('resolveGuideChatErrorCode', () => {
  it('mappe 402 GUIDE_CHAT_INSUFFICIENT_CREDITS', () => {
    expect(
      resolveGuideChatErrorCode(
        new ApiError('Crédits insuffisants.', 402, {
          code: 'GUIDE_CHAT_INSUFFICIENT_CREDITS',
        }),
      ),
    ).toBe('insufficient_credits');
  });

  it('mappe 422 GUIDE_CHAT_NO_SOURCES', () => {
    expect(
      resolveGuideChatErrorCode(
        new ApiError('Pas de sources.', 422, { code: 'GUIDE_CHAT_NO_SOURCES' }),
      ),
    ).toBe('no_sources');
  });

  it('mappe 429 vers rate_limited', () => {
    expect(resolveGuideChatErrorCode(new ApiError('Trop de requêtes.', 429))).toBe(
      'rate_limited',
    );
  });

  it('mappe les erreurs réseau', () => {
    expect(resolveGuideChatErrorCode(new Error('offline'))).toBe('network');
  });
});
