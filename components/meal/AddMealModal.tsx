import { useMemo, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";
import { Alert } from "@/lib/alert";
import type { RecipeRow } from "@/app/_lib/recipes";
import { localIsoDate } from "@/app/_lib/meals";
import { useRecipes } from "@/app/_hooks/useRecipes";
import { insertMealLocal } from "@/app/_powersync/writes";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import type { MealSlot } from "@/data/types";

const SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];
type SlotFilter = MealSlot | "All";

type Props = {
  visible: boolean;
  userId: string | null | undefined;
  onClose: () => void;
  onAdded: () => void;
};

function AddMealModalContent({
  userId,
  onClose,
  onAdded,
}: Omit<Props, "visible">) {
  const recipes = useRecipes(userId);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<SlotFilter>("All");

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesSlot = slotFilter === "All" || recipe.category === slotFilter;
      const matchesSearch = !query || recipe.title.toLowerCase().includes(query);
      return matchesSlot && matchesSearch;
    });
  }, [recipes, search, slotFilter]);

  const onPressRecipe = async (recipe: RecipeRow) => {
    if (!userId || addingId) return;

    // Logging under the selected slot (rather than always the recipe's own
    // category) lets you log e.g. a "Dinner" recipe as tonight's snack.
    const loggedCategory = slotFilter === "All" ? recipe.category : slotFilter;

    setAddingId(recipe.id);
    try {
      await insertMealLocal({
        userId,
        recipeId: recipe.id,
        title: recipe.title,
        category: loggedCategory,
        calories: recipe.calories ?? recipe.nutritions?.calories ?? null,
        imageUrl: recipe.image,
        completed: true,
        mealDate: localIsoDate(),
        nutritions: recipe.nutritions,
        ingredients: recipe.ingredients,
      });
      onAdded();
      onClose();
    } catch {
      Alert.alert("Couldn't add meal", "Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View className="w-full max-h-[85%] rounded-3xl bg-white p-5">
      <Text className="text-base font-bold text-[#2B2320] mb-4">Add from My Recipes</Text>

      {recipes.length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="restaurant-outline" size={24} color={colors.muted} />
          <Text className="mt-3 text-center text-sm text-[#9C9088]">
            You don&apos;t have any recipes yet.{"\n"}Create one first to add it as a meal.
          </Text>
        </View>
      ) : (
        <>
          <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-[#E2DDD9] bg-[#FAF7F4] px-3">
            <Ionicons name="search-outline" size={16} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your recipes"
              placeholderTextColor={colors.muted}
              className="h-10 flex-1 text-sm text-[#2B2320]"
            />
            {search ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <Text className="mb-2 text-xs font-semibold text-[#9C9088]">Log as</Text>
          <View className="mb-4 flex-row flex-wrap" style={{ gap: 8 }}>
            {(["All", ...SLOTS] as SlotFilter[]).map((slot) => {
              const active = slotFilter === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => setSlotFilter(slot)}
                  className={`rounded-full px-3 py-1.5 border ${
                    active ? "bg-[#C85A3A] border-[#C85A3A]" : "bg-white border-[#E2DDD9]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? "text-white" : "text-[#9C9088]"}`}
                    numberOfLines={1}
                  >
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {filteredRecipes.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="search-outline" size={22} color={colors.muted} />
                <Text className="mt-3 text-center text-sm text-[#9C9088]">
                  No recipes match {search ? `"${search}"` : "this filter"}.
                </Text>
              </View>
            ) : (
              filteredRecipes.map((recipe, index) => (
                <Pressable
                  key={recipe.id}
                  onPress={() => onPressRecipe(recipe)}
                  disabled={addingId !== null}
                  className={`flex-row items-center py-3 ${
                    index === filteredRecipes.length - 1 ? "" : "border-b border-[#F0E4DA]"
                  }`}
                >
                  <ImageOrPlaceholder uri={recipe.image} className="h-12 w-12 rounded-xl bg-[#FAF7F4]" />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-[#2B2320]" numberOfLines={1}>
                      {recipe.title}
                    </Text>
                    <Text className="text-xs text-[#9C9088]">
                      {recipe.category ?? "Uncategorized"} ·{" "}
                      {recipe.calories ?? recipe.nutritions?.calories ?? 0} kcal
                    </Text>
                  </View>
                  {addingId === recipe.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </>
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
