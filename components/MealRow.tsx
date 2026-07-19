import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MealEntry } from "../data/types";
import { ImageOrPlaceholder } from "./ui/ImageOrPlaceholder";

type Props = {
  meal: MealEntry;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLast?: boolean;
};

export default function MealRow({ meal, onToggle, onEdit, onDelete, isLast }: Props) {
  return (
    <View
      className={`flex-row items-center py-3 ${
        isLast ? "" : "border-b border-[#F0E4DA]"
      }`}
    >
      <ImageOrPlaceholder uri={meal.imageUrl} className="w-12 h-12 rounded-xl bg-orange-100" />
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-[#2B2320]">{meal.slot}</Text>
        <Text className="text-xs text-[#9C9088]">{meal.recipeTitle}</Text>
      </View>
      <Text className="text-sm text-[#2B2320] mr-3">{meal.calories} kcal</Text>
      {onEdit ? (
        <Pressable
          onPress={() => onEdit(meal.id)}
          hitSlop={8}
          className="w-7 h-7 rounded-full items-center justify-center mr-2 bg-[#FAF7F4]"
        >
          <Ionicons name="pencil" size={13} color="#9C9088" />
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          onPress={() => onDelete(meal.id)}
          hitSlop={8}
          className="w-7 h-7 rounded-full items-center justify-center mr-2 bg-[#FAF7F4]"
        >
          <Ionicons name="trash-outline" size={13} color="#C85A3A" />
        </Pressable>
      ) : null}
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
