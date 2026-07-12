import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";
import { Alert } from "@/lib/alert";
import { getRecipes, type RecipeRow } from "@/app/lib/recipes";
import { createMeal, localIsoDate, PLACEHOLDER_MEAL_IMAGE, type MealRow } from "@/app/lib/meals";

type Props = {
  visible: boolean;
  userId: string | null | undefined;
  onClose: () => void;
  onAdded: (meal: MealRow) => void;
};

function AddMealModalContent({
  userId,
  onClose,
  onAdded,
}: Omit<Props, "visible">) {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getRecipes(userId)
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const onPressRecipe = async (recipe: RecipeRow) => {
    if (!userId || addingId) return;

    setAddingId(recipe.id);
    try {
      const created = await createMeal({
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
      onAdded(created);
      onClose();
    } catch {
      Alert.alert("Couldn't add meal", "Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View className="w-full max-h-[80%] rounded-3xl bg-white p-5">
      <Text className="text-base font-bold text-[#2B2320] mb-4">Add from My Recipes</Text>

      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="restaurant-outline" size={24} color={colors.muted} />
          <Text className="mt-3 text-center text-sm text-[#9C9088]">
            You don&apos;t have any recipes yet.{"\n"}Create one first to add it as a meal.
          </Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {recipes.map((recipe, index) => (
            <Pressable
              key={recipe.id}
              onPress={() => onPressRecipe(recipe)}
              disabled={addingId !== null}
              className={`flex-row items-center py-3 ${
                index === recipes.length - 1 ? "" : "border-b border-[#F0E4DA]"
              }`}
            >
              <Image
                source={{ uri: recipe.image ?? PLACEHOLDER_MEAL_IMAGE }}
                className="h-12 w-12 rounded-xl bg-[#FAF7F4]"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-[#2B2320]" numberOfLines={1}>
                  {recipe.title}
                </Text>
                <Text className="text-xs text-[#9C9088]">
                  {recipe.calories ?? recipe.nutritions?.calories ?? 0} kcal
                </Text>
              </View>
              {addingId === recipe.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={onClose}
        className="mt-4 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
      >
        <Text className="text-sm font-semibold text-[#9C9088]">Close</Text>
      </Pressable>
    </View>
  );
}

export default function AddMealModal({ visible, userId, onClose, onAdded }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        {visible ? (
          <Pressable onPress={() => {}}>
            <AddMealModalContent userId={userId} onClose={onClose} onAdded={onAdded} />
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}
