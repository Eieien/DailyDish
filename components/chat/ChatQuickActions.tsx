import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

interface QuickAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

const ACTIONS: QuickAction[] = [
  { label: 'Scan/Estimate food', icon: 'scan-outline' },
  { label: 'Suggest Meal', icon: 'restaurant-outline' },
];

interface ChatQuickActionsProps {
  onAction?: (label: string) => void;
}

export const ChatQuickActions: React.FC<ChatQuickActionsProps> = ({ onAction }) => {
  return (
    <View className="flex-row flex-wrap justify-center gap-2 px-4 pb-2">
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => onAction?.(action.label)}
          className="flex-row items-center gap-1.5 rounded-full border border-primary bg-surface px-4 py-2 active:opacity-70">
          <Ionicons name={action.icon} size={15} color={colors.primary} />
          <Text className="font-urbanist-semibold text-[13px] text-primary">{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};
