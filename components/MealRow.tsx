import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MealEntry } from "../data/types";

type Props = {
  meal: MealEntry;
  onToggle: (id: string) => void;
  isLast?: boolean;
};

export default function MealRow({ meal, onToggle, isLast }: Props) {
  return (
    <View
      className={`flex-row items-center py-3 ${
        isLast ? "" : "border-b border-[#F0E4DA]"
      }`}
    >
      <Image
        source={{ uri: meal.imageUrl }}
        className="w-12 h-12 rounded-xl bg-orange-100"
      />
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-[#2B2320]">{meal.slot}</Text>
        <Text className="text-xs text-[#9C9088]">{meal.recipeTitle}</Text>
      </View>
      <Text className="text-sm text-[#2B2320] mr-3">{meal.calories} kcal</Text>
      <Pressable
        onPress={() => onToggle(meal.id)}
        className={`w-6 h-6 rounded-full items-center justify-center ${
          meal.completed ? "bg-[#D2601A]" : "border border-[#E3D6CA]"
        }`}
      >
        {meal.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
      </Pressable>
    </View>
  );
}
