import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { shouldUseMockData } from '../lib/config';
import * as guideChatApi from '../lib/api/guideChat';
import {
  trackGuideChatError,
  trackGuideChatSend,
} from '../lib/analytics';
import {
  fetchMockGuideChatMessages,
  sendMockGuideChatMessage,
} from '../lib/mockGuideChat';
import type { GuideChatMessage } from '../types/guideChat';
import { ApiError } from '../types/api';
import { resolveGuideChatErrorCode } from '../lib/mappers/guideChat';

const MAX_MESSAGE_LENGTH = 4000;

export type { GuideChatErrorCode } from '../lib/mappers/guideChat';

interface UseGuideChatOptions {
  poiId: string;
  poiName: string;
  guideTitle: string;
  enabled: boolean;
}

export function useGuideChat({
  poiId,
  poiName,
  guideTitle,
  enabled,
}: UseGuideChatOptions) {
  const { isAuthenticated, isLoading: isAuthLoading, isMockSession } = useAuth();
  const [messages, setMessages] = useState<GuideChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorCode, setErrorCode] = useState<GuideChatErrorCode | null>(null);
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const loadVersionRef = useRef(0);

  const useMock = shouldUseMockData(isMockSession);

  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;

    const version = ++loadVersionRef.current;
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = useMock
        ? await fetchMockGuideChatMessages(poiId)
        : await guideChatApi.fetchGuideChatMessages(poiId);

      if (version !== loadVersionRef.current) return;

      setMessages(response.messages);
      setCreditsBalance(response.creditsBalance ?? null);
    } catch (error) {
      if (version !== loadVersionRef.current) return;
      const code = resolveGuideChatErrorCode(error);
      setErrorCode(code);
      trackGuideChatError(
        poiId,
        code,
        error instanceof ApiError ? error.statusCode : undefined,
      );
    } finally {
      if (version === loadVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, poiId, useMock]);

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
        const response = useMock
          ? await sendMockGuideChatMessage(poiId, content, { guideTitle, poiName })
          : await guideChatApi.sendGuideChatMessage(poiId, { content });

        setMessages((current) => [
          ...current,
          response.userMessage,
          response.assistantMessage,
        ]);
        setCreditsBalance(response.creditsBalance ?? null);
        trackGuideChatSend(poiId, content.length);
        return true;
      } catch (error) {
        const code = resolveGuideChatErrorCode(error);
        setErrorCode(code);
        trackGuideChatError(
          poiId,
          code,
          error instanceof ApiError ? error.statusCode : undefined,
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [guideTitle, isAuthenticated, isSending, poiId, poiName, useMock],
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
