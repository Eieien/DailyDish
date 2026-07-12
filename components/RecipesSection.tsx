import React from "react";
import { View, Text, Pressable } from "react-native";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../data/types";

type Props = {
  title: string;
  recipes: Recipe[];
  onPressRecipe: (recipe: Recipe) => void;
  onPressSeeAll?: () => void;
  onDeleteRecipe?: (recipe: Recipe) => void;
};

export default function RecipesSection({
  title,
  recipes,
  onPressRecipe,
  onPressSeeAll,
  onDeleteRecipe,
}: Props) {
  return (
    <View className="mx-5 mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-[#2B2320]">{title}</Text>
        {onPressSeeAll ? (
          <Pressable onPress={onPressSeeAll}>
            <Text className="text-[#D2601A] text-sm font-medium">See all</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="flex-row flex-wrap justify-between">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onPress={onPressRecipe}
            onDelete={onDeleteRecipe}
          />
        ))}
      </View>
    </View>
  );
}
