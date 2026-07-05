import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/constants/theme';

export const ChatHeader: React.FC = () => {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
      <Pressable
        onPress={goBack}
        hitSlop={12}
        className="h-9 w-9 items-center justify-center rounded-full bg-surface shadow-sm active:opacity-70">
        <Ionicons name="chevron-back" size={20} color={colors.ink} />
      </Pressable>
      <Text className="font-urbanist-bold text-lg text-ink">DailyDish AI</Text>
    </View>
  );
};
