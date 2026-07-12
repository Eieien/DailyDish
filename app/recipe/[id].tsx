import { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';

import {
  RecipeHero,
  NutritionBar,
  IngredientsSection,
  StepsSection,
  RecipeActions,
} from '../../components/recipe';
import { getRecipeById, type RecipeRow } from '../lib/recipes';
import { createMeal, localIsoDate } from '../lib/meals';
import { colors } from '@/constants/theme';
import { Alert } from '@/lib/alert';

/**
 * Recipe details screen.
 *
 * Reads the `id` route param, fetches the matching recipe from the API, and
 * renders the hero, nutrition facts, ingredients, steps, and action buttons.
 * Composed entirely from components in `components/recipe`.
 */
export default function RecipeDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const [recipe, setRecipe] = useState<RecipeRow | null | undefined>(undefined);
  const [addingToMeals, setAddingToMeals] = useState(false);
  const [addedToMeals, setAddedToMeals] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecipeById(id).then(setRecipe);
  }, [id]);

  const onAddToMeals = async () => {
    if (!recipe || addingToMeals || addedToMeals) return;

    if (!userId) {
      Alert.alert('Please wait', "Still signing you in — try again in a moment.");
      return;
    }

    setAddingToMeals(true);
    try {
      await createMeal({
        userId,
        recipeId: recipe.id,
        title: recipe.title,
        category: recipe.category,
        calories: recipe.calories ?? recipe.nutritions?.calories ?? null,
        imageUrl: recipe.image,
        completed: true,
        mealDate: localIsoDate(),
        nutritions: recipe.nutritions,
        ingredients: recipe.ingredients,
      });
      setAddedToMeals(true);
    } catch {
      Alert.alert("Couldn't add meal", 'Please try again.');
    } finally {
      setAddingToMeals(false);
    }
  };

  if (recipe === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (recipe === null) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral px-8">
        <Text className="font-urbanist-semibold text-base text-ink">Recipe not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <RecipeHero
          image={recipe.image ?? ''}
          onEdit={() => router.push(`/addRecipes?id=${recipe.id}`)}
        />

        <View className="gap-5 px-5 pt-5">
          <Text className="font-urbanist-extrabold text-2xl text-ink">{recipe.title}</Text>

          <NutritionBar
            nutrition={{
              calories: recipe.calories ?? recipe.nutritions?.calories ?? 0,
              protein: recipe.nutritions?.protein ?? 0,
              fat: recipe.nutritions?.fat ?? 0,
              carbs: recipe.nutritions?.carbs ?? 0,
            }}
          />

          <IngredientsSection ingredients={recipe.ingredients ?? []} />

          <StepsSection steps={recipe.steps ?? []} />

          <RecipeActions
            onAddToMeals={onAddToMeals}
            addingToMeals={addingToMeals}
            addedToMeals={addedToMeals}
          />
        </View>
      </ScrollView>
    </View>
  );
}
