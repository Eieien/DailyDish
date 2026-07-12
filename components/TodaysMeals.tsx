import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MealRow from "./MealRow";
import { MealEntry } from "../data/types";

type Props = {
  meals: MealEntry[];
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddMeal?: () => void;
};

export default function TodaysMeals({ meals, onToggle, onEdit, onDelete, onAddMeal }: Props) {
  return (
    <View className="mx-5 mt-5 bg-white rounded-3xl p-5">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="font-bold text-[#2B2320]">Today&apos;s Meals</Text>
        {onAddMeal ? (
          <Pressable
            onPress={onAddMeal}
            hitSlop={8}
            className="w-7 h-7 rounded-full bg-[#D2601A] items-center justify-center active:opacity-80"
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
      <View>
        {meals.map((meal, index) => (
          <MealRow
            key={meal.id}
            meal={meal}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={index === meals.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
