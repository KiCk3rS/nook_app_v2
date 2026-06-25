import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useGuideChat, type GuideChatErrorCode } from '../../hooks/useGuideChat';
import type { GuideChatMessage } from '../../types/guideChat';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface AudioDiscussionPanelProps {
  poiId: string;
  poiName: string;
  guideTitle: string;
  enabled: boolean;
}

function MessageBubble({ message }: { message: GuideChatMessage }) {
  const { t } = useTranslation('audioPlayer');
  const isUser = message.role === 'user';

  return (
    <View
      style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}
      accessibilityRole="text"
      accessibilityLabel={
        isUser
          ? t('discussionMessageYou', { content: message.content })
          : t('discussionMessageGuide', { content: message.content })
      }
    >
      <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant]}>
        <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function ErrorBanner({
  errorCode,
  onRetry,
}: {
  errorCode: GuideChatErrorCode;
  onRetry: () => void;
}) {
  const { t } = useTranslation('audioPlayer');
  const router = useRouter();

  const messageKey: Record<GuideChatErrorCode, string> = {
    network: 'discussionErrorNetwork',
    unauthorized: 'discussionErrorUnauthorized',
    insufficient_credits: 'discussionErrorCredits',
    no_sources: 'discussionErrorNoSources',
    rate_limited: 'discussionErrorRateLimited',
    unknown: 'discussionErrorUnknown',
  };

  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{t(messageKey[errorCode])}</Text>
      <View style={styles.errorActions}>
        {errorCode === 'insufficient_credits' ? (
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('discussionGetCredits')}
          >
            <Text style={styles.errorLink}>{t('discussionGetCredits')}</Text>
          </Pressable>
        ) : null}
        {errorCode === 'network' || errorCode === 'unknown' || errorCode === 'rate_limited' ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={t('discussionRetry')}
          >
            <Text style={styles.errorLink}>{t('discussionRetry')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function AudioDiscussionPanel({
  poiId,
  poiName,
  guideTitle,
  enabled,
}: AudioDiscussionPanelProps) {
  const { t } = useTranslation('audioPlayer');
  const router = useRouter();
  const pathname = usePathname();
  const listRef = useRef<FlatList<GuideChatMessage>>(null);
  const [draft, setDraft] = useState('');

  const {
    messages,
    isLoading,
    isSending,
    errorCode,
    isAuthenticated,
    isAuthLoading,
    loadMessages,
    sendMessage,
    maxMessageLength,
  } = useGuideChat({ poiId, poiName, guideTitle, enabled });

  const handleSignIn = useCallback(() => {
    router.push({
      pathname: '/auth/login',
      params: { returnTo: pathname, source: 'guide_chat' },
    });
  }, [pathname, router]);

  const handleSend = useCallback(async () => {
    const sent = await sendMessage(draft);
    if (sent) {
      setDraft('');
    }
  }, [draft, sendMessage]);

  useEffect(() => {
    if (messages.length === 0) return;
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isSending]);

  if (isAuthLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredState}>
        <Ionicons name="chatbubble-outline" size={56} color={colors.hairline} />
        <Text style={styles.emptyTitle}>{t('discussionAuthTitle')}</Text>
        <Text style={styles.emptySubtitle}>{t('discussionAuthSubtitle')}</Text>
        <Pressable
          style={({ pressed }) => [styles.authButton, pressed && styles.authButtonPressed]}
          onPress={handleSignIn}
          accessibilityRole="button"
          accessibilityLabel={t('discussionSignIn')}
        >
          <Text style={styles.authButtonText}>{t('discussionSignIn')}</Text>
        </Pressable>
      </View>
    );
  }

  const canSend = draft.trim().length > 0 && !isSending && !isLoading;
  const showEmptyState = !isLoading && messages.length === 0 && !errorCode;

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        {errorCode ? <ErrorBanner errorCode={errorCode} onRetry={() => void loadMessages()} /> : null}

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : showEmptyState ? (
          <View style={styles.centeredState}>
            <Ionicons name="chatbubble-outline" size={56} color={colors.hairline} />
            <Text style={styles.emptyTitle}>{t('discussionEmptyTitle')}</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {isSending ? (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={colors.muted} />
            <Text style={styles.typingText}>{t('discussionTyping')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.composerRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={t('discussionInputPlaceholder')}
          placeholderTextColor={colors.mutedSoft}
          multiline
          maxLength={maxMessageLength}
          editable={!isSending && !isLoading}
          accessibilityLabel={t('discussionInputPlaceholder')}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (canSend) void handleSend();
          }}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendButtonDisabled,
            pressed && canSend && styles.sendButtonPressed,
          ]}
          onPress={() => void handleSend()}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('discussionSend')}
          accessibilityState={{ disabled: !canSend }}
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? colors.onPrimary : colors.mutedSoft}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    gap: spacing.sm,
  },
  body: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
    textAlign: 'center',
  },
  authButton: {
    marginTop: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  authButtonText: {
    ...textStyle('bodyMd'),
    color: colors.onPrimary,
    fontWeight: Platform.select({ ios: '600', default: '700' }),
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
  },
  messageBubbleAssistant: {
    backgroundColor: colors.surfaceSoft,
    borderBottomLeftRadius: radius.xs,
  },
  messageText: {
    ...textStyle('bodyMd'),
  },
  messageTextUser: {
    color: colors.onPrimary,
  },
  messageTextAssistant: {
    color: colors.ink,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  typingText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
    ...textStyle('bodyMd'),
    color: colors.ink,
  },
  sendButton: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceStrong,
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  errorBanner: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    gap: spacing.xs,
  },
  errorText: {
    ...textStyle('bodySm'),
    color: colors.primaryErrorText,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorLink: {
    ...textStyle('bodySm'),
    color: colors.primary,
    fontWeight: Platform.select({ ios: '600', default: '700' }),
  },
});
