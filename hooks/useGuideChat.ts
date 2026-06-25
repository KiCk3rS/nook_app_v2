import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { isMockAccessToken } from '../constants/mockUser';
import * as guideChatApi from '../lib/api/guideChat';
import { getMemoryAccessToken } from '../lib/api/client';
import { isApiConfigured } from '../lib/config';
import {
  fetchMockGuideChatMessages,
  sendMockGuideChatMessage,
} from '../lib/mockGuideChat';
import type { GuideChatMessage } from '../types/guideChat';
import { ApiError } from '../types/api';

const MAX_MESSAGE_LENGTH = 4000;

export type GuideChatErrorCode =
  | 'network'
  | 'unauthorized'
  | 'insufficient_credits'
  | 'no_sources'
  | 'rate_limited'
  | 'unknown';

interface UseGuideChatOptions {
  poiId: string;
  poiName: string;
  guideTitle: string;
  enabled: boolean;
}

function resolveErrorCode(error: unknown): GuideChatErrorCode {
  if (!(error instanceof ApiError)) {
    return 'network';
  }
  if (error.statusCode === 401) return 'unauthorized';
  if (error.statusCode === 402) return 'insufficient_credits';
  if (error.statusCode === 422 && error.code === 'GUIDE_CHAT_NO_SOURCES') {
    return 'no_sources';
  }
  if (error.statusCode === 429) return 'rate_limited';
  return 'unknown';
}

function shouldUseMock(): boolean {
  return !isApiConfigured() || isMockAccessToken(getMemoryAccessToken());
}

export function useGuideChat({
  poiId,
  poiName,
  guideTitle,
  enabled,
}: UseGuideChatOptions) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<GuideChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorCode, setErrorCode] = useState<GuideChatErrorCode | null>(null);
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const loadVersionRef = useRef(0);

  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;

    const version = ++loadVersionRef.current;
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = shouldUseMock()
        ? await fetchMockGuideChatMessages(poiId)
        : await guideChatApi.fetchGuideChatMessages(poiId);

      if (version !== loadVersionRef.current) return;

      setMessages(response.messages);
      setCreditsBalance(response.creditsBalance ?? null);
    } catch (error) {
      if (version !== loadVersionRef.current) return;
      setErrorCode(resolveErrorCode(error));
    } finally {
      if (version === loadVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, poiId]);

  useEffect(() => {
    if (!enabled || isAuthLoading || !isAuthenticated) {
      return;
    }
    void loadMessages();
  }, [enabled, isAuthLoading, isAuthenticated, loadMessages]);

  useEffect(() => {
    if (!enabled) {
      loadVersionRef.current += 1;
      setIsLoading(false);
      setIsSending(false);
      setErrorCode(null);
    }
  }, [enabled]);

  const sendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || isSending || !isAuthenticated) return false;

      if (content.length > MAX_MESSAGE_LENGTH) {
        setErrorCode('unknown');
        return false;
      }

      setIsSending(true);
      setErrorCode(null);

      try {
        const response = shouldUseMock()
          ? await sendMockGuideChatMessage(poiId, content, { guideTitle, poiName })
          : await guideChatApi.sendGuideChatMessage(poiId, { content });

        setMessages((current) => [
          ...current,
          response.userMessage,
          response.assistantMessage,
        ]);
        setCreditsBalance(response.creditsBalance ?? null);
        return true;
      } catch (error) {
        setErrorCode(resolveErrorCode(error));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [guideTitle, isAuthenticated, isSending, poiId, poiName],
  );

  return {
    messages,
    isLoading,
    isSending,
    errorCode,
    creditsBalance,
    isAuthenticated,
    isAuthLoading,
    loadMessages,
    sendMessage,
    maxMessageLength: MAX_MESSAGE_LENGTH,
  };
}
