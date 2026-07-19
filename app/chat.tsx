import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
import { usePowerSync } from '@powersync/react';

import {
  ChatHeader,
  ChatBubble,
  ChatQuickActions,
  ChatInputBar,
  TypingIndicator,
} from '../components/chat';
import { sendChatMessage } from './_lib/ai';
import {
  appendMessage,
  createSession,
  getSession,
  listSessions,
  updateSessionTitle,
} from './_lib/sessions';
import { useUserProfile } from './_hooks/useUserProfile';
import { useIsOnline } from './_hooks/useIsOnline';
import { fetchLocalUserContext } from './_lib/aiContext';
import {
  buildRecapText,
  getYesterdaysTotals,
  hasShownRecapToday,
  isPastRecapCutoff,
  markRecapShown,
} from './_lib/dailyRecap';
import { colors } from '@/constants/theme';
import type { ChatMessage } from './_types/chat';

const GREETING_TEXT = "Hi! I'm your DailyDish AI assistant. How can I help you today?";
const IS_NATIVE = Platform.OS !== 'web';

function truncateTitle(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [titled, setTitled] = useState(false);

  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const userProfile = useUserProfile(userId);
  const powersync = usePowerSync();
  const isOnline = useIsOnline();
  const { sessionId: resumeSessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const nextId = () => {
    idRef.current += 1;
    return `m${idRef.current}`;
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  // Reach a specific session (from History), or otherwise continue the most
  // recently active one — only starting a brand new session if the user has
  // none yet. Either way, append a computed (non-LLM) recap of yesterday's
  // totals if it hasn't been shown yet today.
  useEffect(() => {
    let cancelled = false;

    const loadMessagesFrom = (rows: { id: string; role: string; message: string }[]) =>
      rows.map((m) => ({
        id: m.id,
        role: (m.role === 'user' ? 'user' : 'assistant') as ChatMessage['role'],
        text: m.message,
      }));

    const maybeAppendRecap = async (activeSessionId: string) => {
      if (!userId || !isPastRecapCutoff() || (await hasShownRecapToday(userId))) return;

      const yesterday = await getYesterdaysTotals(userId);
      const recapText = buildRecapText(yesterday, userProfile?.dailyCalorieTarget ?? null);
      if (cancelled) return;
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: recapText }]);
      appendMessage(activeSessionId, 'assistant', recapText).catch(() => {});
      markRecapShown(userId).catch(() => {});
    };

    const setup = async () => {
      if (resumeSessionId) {
        const result = await getSession(resumeSessionId);
        if (cancelled) return;
        if (result) {
          setSessionId(result.session.id);
          setTitled(result.session.title !== 'New chat');
          setMessages(loadMessagesFrom(result.messages));
          return;
        }
      }

      if (!userId) return;

      const existing = await listSessions(userId);
      if (cancelled) return;

      // listSessions is ordered by updatedAt desc, so [0] is the most recent.
      const mostRecent = existing.length > 0 ? await getSession(existing[0].id) : null;
      if (cancelled) return;

      if (mostRecent) {
        setSessionId(mostRecent.session.id);
        setTitled(mostRecent.session.title !== 'New chat');
        setMessages(loadMessagesFrom(mostRecent.messages));
        await maybeAppendRecap(mostRecent.session.id);
        return;
      }

      const session = await createSession(userId);
      if (cancelled) return;
      setSessionId(session.id);
      setMessages([{ id: nextId(), role: 'assistant', text: GREETING_TEXT }]);
      await maybeAppendRecap(session.id);
    };

    setup().catch((error) => {
      console.log('Failed to set up chat session:', error);
    });

    return () => {
      cancelled = true;
    };
    // Only re-run when switching which session we're loading, not on every
    // profile refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, resumeSessionId]);

  const handleSend = async (text: string) => {
    if (isSending || !sessionId || !isOnline) return;

    const userMessage: ChatMessage = { id: nextId(), role: 'user', text };
    const history = [...messages, userMessage];
    setMessages(history);
    setIsSending(true);
    scrollToEnd();
    appendMessage(sessionId, 'user', text).catch(() => {});

    if (!titled) {
      setTitled(true);
      updateSessionTitle(sessionId, truncateTitle(text)).catch(() => {});
    }

    try {
      // Native reads context straight from local PowerSync storage (fresh at
      // send time); web has no local sync to read, so the server builds it
      // from Postgres instead (see app/api/chat+api.ts).
      const context = IS_NATIVE ? await fetchLocalUserContext(powersync, userId) : undefined;
      const reply = await sendChatMessage(history, { userId, context });
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply }]);
      appendMessage(sessionId, 'assistant', reply).catch(() => {});
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Something went wrong.';
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text }]);
    } finally {
      setIsSending(false);
      scrollToEnd();
    }
  };

  return (
    <View className="flex-1 bg-neutral" style={{ paddingTop: insets.top }}>
      <ChatHeader />

      {!isOnline ? (
        <View className="mx-4 mt-2 flex-row items-center gap-2 rounded-2xl bg-[#F5E3D8] px-3 py-2">
          <Ionicons name="cloud-offline-outline" size={16} color="#9C6B3E" />
          <Text className="flex-1 text-xs font-semibold text-[#9C6B3E]">
            You&apos;re offline — reconnect to chat with the assistant.
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}>
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {sessionId === null && messages.length === 0 ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isSending ? <TypingIndicator /> : null}
        </ScrollView>

        <View className="gap-2 px-2 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
          <ChatQuickActions onAction={handleSend} />
          <ChatInputBar onSend={handleSend} disabled={isSending || !sessionId || !isOnline} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
