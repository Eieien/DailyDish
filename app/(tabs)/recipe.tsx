import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import SearchBar from "../../components/SearchBar";
import RecipesSection from "../../components/RecipesSection";
import BottomNav from "../../components/BottomNav";

import { Recipe } from "../../data/types";
import { toRecipeCardData } from "../lib/recipes";
import { deleteRecipeLocal } from "../powersync/writes";
import { useRecipes } from "../hooks/useRecipes";
import { Alert } from "@/lib/alert";

const CATEGORY_FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
type SortOrder = "az" | "za";

export default function RecipeScreen() {
  const router = useRouter();
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const [search, setSearch] = useState("");
  const rows = useRecipes(userId);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");

  const visibleRecipes: Recipe[] = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const matchesCategory = category === "All" || row.category === category;
      const matchesQuery = !query || row.title.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered].sort((a, b) =>
      sortOrder === "az" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );

    return sorted.map(toRecipeCardData);
  }, [rows, search, category, sortOrder]);

  const onPressFilter = () => {
    Alert.alert("Filter by category", undefined, [
      ...CATEGORY_FILTERS.map((filter) => ({
        text: filter,
        onPress: () => setCategory(filter),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onDeleteRecipe = (recipe: Recipe) => {
    Alert.alert("Delete recipe?", `"${recipe.title}" will be removed permanently.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRecipeLocal(recipe.id),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Text className="text-xl font-bold text-[#2B2320]">My Recipes</Text>
          <Pressable
            onPress={() => router.push("/addRecipes")}
            className="w-10 h-10 rounded-full bg-[#D2601A] items-center justify-center active:opacity-90"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <SearchBar value={search} onChangeText={setSearch} onPressFilter={onPressFilter} />

        <View className="flex-row items-center justify-between mt-3 px-5">
          {category !== "All" ? (
            <Pressable
              onPress={() => setCategory("All")}
              className="flex-row items-center gap-1.5 rounded-full bg-[#D2601A] px-3 py-1.5"
            >
              <Text className="text-xs font-semibold text-white">{category}</Text>
              <Ionicons name="close" size={12} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={() => setSortOrder((prev) => (prev === "az" ? "za" : "az"))}
            className="flex-row items-center gap-1 rounded-full bg-white border border-[#F0E4DA] px-3 py-2"
          >
            <Ionicons name="swap-vertical" size={14} color="#9C9088" />
            <Text className="text-xs font-semibold text-[#9C9088]">
              {sortOrder === "az" ? "A-Z" : "Z-A"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {visibleRecipes.length === 0 ? (
            <View className="items-center justify-center mt-16 px-8">
              <Ionicons name="restaurant-outline" size={28} color="#9C9088" />
              <Text className="text-sm text-[#9C9088] font-medium text-center mt-3">
                {rows.length === 0
                  ? "You haven't added any recipes yet.\nTap + to create your first one."
                  : "No recipes match your filters."}
              </Text>
            </View>
          ) : (
            <RecipesSection
              title="All Recipes"
              recipes={visibleRecipes}
              onPressRecipe={(recipe) => router.push(`/recipe/${recipe.id}`)}
              onDeleteRecipe={onDeleteRecipe}
            />
          )}
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}
