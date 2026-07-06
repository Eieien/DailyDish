import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { RecipeNutrition } from '@/app/types/recipe';
import { colors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface NutritionStatProps {
  icon: IconName;
  value: string;
  label: string;
}

const NutritionStat: React.FC<NutritionStatProps> = ({ icon, value, label }) => {
  return (
    <View className="flex-1 items-center rounded-2xl bg-surface py-3 shadow-sm">
      <View className="mb-1 h-9 w-9 items-center justify-center rounded-full bg-neutral">
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <Text className="font-urbanist-bold text-sm text-ink">{value}</Text>
      <Text className="font-urbanist text-[11px] text-muted">{label}</Text>
    </View>
  );
};

interface NutritionBarProps {
  nutrition: RecipeNutrition;
}

export const NutritionBar: React.FC<NutritionBarProps> = ({ nutrition }) => {
  return (
    <View className="flex-row gap-3">
      <NutritionStat icon="fire" value={String(nutrition.calories)} label="Calories" />
      <NutritionStat icon="food-drumstick" value={`${nutrition.protein}g`} label="Protein" />
      <NutritionStat icon="water" value={`${nutrition.fat}g`} label="Fat" />
      <NutritionStat icon="barley" value={`${nutrition.carbs}g`} label="Carbs" />
    </View>
  );
};
