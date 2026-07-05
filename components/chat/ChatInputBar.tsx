import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend, disabled = false }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-sm">
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Ask me anything..."
        placeholderTextColor={colors.muted}
        returnKeyType="send"
        editable={!disabled}
        onSubmitEditing={handleSend}
        className="flex-1 font-urbanist text-[15px] text-ink"
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled}
        className={`h-9 w-9 items-center justify-center rounded-full bg-primary ${
          disabled ? 'opacity-40' : 'active:opacity-90'
        }`}>
        <Ionicons name="send" size={16} color={colors.surface} />
      </Pressable>
    </View>
  );
};
