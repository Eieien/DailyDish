import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import RecipeHeaderImage from "../../components/recipe-detail/RecipeHeaderImage";
import NutritionStats from "../../components/recipe-detail/NutritionStats";
import IngredientsCard from "../../components/recipe-detail/IngredientsCard";
import StepsCard from "../../components/recipe-detail/StepsCard";
import ActionButtons from "../../components/recipe-detail/ActionButtons";

import { recipes } from "../../data/mockData";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-[#FDF3EC] items-center justify-center">
        <Text className="text-[#2B2320]">Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <RecipeHeaderImage imageUrl={recipe.image} />

        <View className="px-5 mt-4">
          <Text className="text-2xl font-bold text-[#2B2320]">
            {recipe.title}
          </Text>
        </View>

        <NutritionStats macros={recipe.macros} />
        <IngredientsCard ingredients={recipe.ingredients} />
        <StepsCard steps={recipe.steps} />

        <ActionButtons
          onAddToMeals={() => {}}
          onSaveRecipe={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
