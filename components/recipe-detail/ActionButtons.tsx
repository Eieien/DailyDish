import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onAddToMeals: () => void;
  onSaveRecipe: () => void;
};

export default function ActionButtons({ onAddToMeals, onSaveRecipe }: Props) {
  return (
    <View className="mx-5 mt-5 mb-6">
      <Pressable
        onPress={onAddToMeals}
        className="flex-row items-center justify-center bg-[#D2601A] rounded-2xl py-4 mb-3"
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        <Text className="text-white font-semibold ml-2">
          Add to Today's Meals
        </Text>
      </Pressable>

      <Pressable
        onPress={onSaveRecipe}
        className="flex-row items-center justify-center bg-white border border-[#D2601A] rounded-2xl py-4"
      >
        <Ionicons name="bookmark-outline" size={16} color="#D2601A" />
        <Text className="text-[#D2601A] font-semibold ml-2">
          Save to My Recipes
        </Text>
      </Pressable>
    </View>
  );
}
