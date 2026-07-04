import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

interface RecipeActionsProps {
  onAddToMeals?: () => void;
  onSaveRecipe?: () => void;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({ onAddToMeals, onSaveRecipe }) => {
  return (
    <View className="gap-3">
      <Pressable
        onPress={onAddToMeals}
        className="flex-row items-center justify-center rounded-full bg-primary py-4 shadow-sm active:opacity-90">
        <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
        <Text className="ml-2 font-urbanist-bold text-base text-white">
          Add to Today&apos;s Meals
        </Text>
      </Pressable>

      <Pressable
        onPress={onSaveRecipe}
        className="flex-row items-center justify-center rounded-full border border-primary bg-surface py-4 active:opacity-70">
        <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
        <Text className="ml-2 font-urbanist-semibold text-base text-primary">
          Save to My Recipes
        </Text>
      </Pressable>
    </View>
  );
};
