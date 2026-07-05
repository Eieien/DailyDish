import { View, Text } from 'react-native';

import { BotAvatar } from './BotAvatar';

export const TypingIndicator: React.FC = () => {
  return (
    <View className="mb-4 flex-row items-end gap-2">
      <BotAvatar size={44} />
      <View className="rounded-3xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
        <Text className="font-urbanist-bold text-base text-muted">…</Text>
      </View>
    </View>
  );
};
