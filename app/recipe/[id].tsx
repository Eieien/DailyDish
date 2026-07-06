import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  RecipeHero,
  NutritionBar,
  IngredientsSection,
  StepsSection,
  RecipeActions,
} from '../../components/recipe';
import { getRecipeById } from '../../data/recipes';

/**
 * Recipe details screen.
 *
 * Reads the `id` route param, resolves the matching recipe, and renders the
 * hero, nutrition facts, ingredients, steps, and action buttons. Composed
 * entirely from components in `components/recipe`.
 */
export default function RecipeDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const recipe = getRecipeById(id);

  return (
    <View className="flex-1 bg-neutral">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <RecipeHero image={recipe.image} />

        <View className="gap-5 px-5 pt-5">
          <Text className="font-urbanist-extrabold text-2xl text-ink">{recipe.title}</Text>

          <NutritionBar nutrition={recipe.nutrition} />

          <IngredientsSection ingredients={recipe.ingredients} />

          <StepsSection steps={recipe.steps} />

          <RecipeActions />
        </View>
      </ScrollView>
    </View>
  );
}
