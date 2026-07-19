import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

interface RecipeActionsProps {
  onAddToMeals?: () => void;
  onEditRecipe?: () => void;
  addingToMeals?: boolean;
  addedToMeals?: boolean;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({
  onAddToMeals,
  onEditRecipe,
  addingToMeals = false,
  addedToMeals = false,
}) => {
  return (
    <View className="gap-3">
      <Pressable
        onPress={onAddToMeals}
        disabled={addingToMeals || addedToMeals}
        className={`flex-row items-center justify-center rounded-full py-4 shadow-sm ${
          addedToMeals ? 'bg-accent' : 'bg-primary active:opacity-90'
        }`}>
        {addingToMeals ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <>
            <Ionicons
              name={addedToMeals ? 'checkmark-circle' : 'add-circle-outline'}
              size={20}
              color={colors.surface}
            />
            <Text className="ml-2 font-urbanist-bold text-base text-white">
              {addedToMeals ? "Added to Today's Meals" : "Add to Today's Meals"}
            </Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={onEditRecipe}
        className="flex-row items-center justify-center rounded-full border border-primary bg-surface py-4 active:opacity-70">
        <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        <Text className="ml-2 font-urbanist-semibold text-base text-primary">Edit Recipe</Text>
      </Pressable>
    </View>
  );
};
