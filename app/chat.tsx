import { useRef, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChatHeader,
  ChatBubble,
  ChatQuickActions,
  ChatInputBar,
  TypingIndicator,
} from '../components/chat';
import { sendChatMessage } from './lib/ai';
import type { ChatMessage } from './types/chat';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: "Hi! I'm your DailyDish AI assistant. How can I help you today?",
  },
];

export default function Chat() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(INITIAL_MESSAGES.length);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isSending, setIsSending] = useState(false);

  const nextId = () => {
    idRef.current += 1;
    return `m${idRef.current}`;
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const handleSend = async (text: string) => {
    if (isSending) return;

    const userMessage: ChatMessage = { id: nextId(), role: 'user', text };
    const history = [...messages, userMessage];
    setMessages(history);
    setIsSending(true);
    scrollToEnd();

    try {
      const reply = await sendChatMessage(history);
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply }]);
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
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isSending ? <TypingIndicator /> : null}
        </ScrollView>

        <View className="gap-2 px-2 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
          <ChatQuickActions onAction={handleSend} />
          <ChatInputBar onSend={handleSend} disabled={isSending} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
