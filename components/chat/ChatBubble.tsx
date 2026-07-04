import { View, Text } from 'react-native';

import type { ChatMessage } from '@/types/chat';
import { BotAvatar } from './BotAvatar';
import { Markdown } from './Markdown';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View className="mb-4 flex-row justify-end">
        <View className="max-w-[78%] rounded-3xl rounded-tr-md bg-primary/25 px-4 py-3">
          <Text className="font-urbanist-medium text-[15px] leading-5 text-ink">
            {message.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4 flex-row items-end gap-2">
      <BotAvatar size={44} />
      <View className="max-w-[78%] rounded-3xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
        <Markdown content={message.text} />
      </View>
    </View>
  );
};
