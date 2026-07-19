import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "../data/types";
import { ImageOrPlaceholder } from "./ui/ImageOrPlaceholder";

type Props = {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
};

export default function RecipeCard({ recipe, onPress, onDelete }: Props) {
  return (
    <Pressable
      onPress={() => onPress(recipe)}
      style={{ width: "48%" }}
      className="bg-white rounded-2xl mb-4 overflow-hidden"
    >
      <ImageOrPlaceholder uri={recipe.image} className="w-full h-24" />
      <View className="p-3">
        <Text className="font-semibold text-[#2B2320]" numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text className="text-xs text-[#9C9088] mt-1" numberOfLines={2}>
          {recipe.description}
        </Text>
      </View>
      {onDelete ? (
        <Pressable
          onPress={() => onDelete(recipe)}
          hitSlop={8}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white items-center justify-center border border-[#F0E4DA] active:opacity-70"
        >
          <Ionicons name="trash-outline" size={14} color="#C85A3A" />
        </Pressable>
      ) : null}
      <View className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white items-center justify-center border border-[#F0E4DA]">
        <Ionicons name="arrow-up-outline" size={14} color="#D2601A" />
      </View>
    </Pressable>
  );
}
