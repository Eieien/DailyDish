import React from "react";
import { View, Text } from "react-native";
import MealRow from "./MealRow";
import { MealEntry } from "../data/types";

type Props = {
  meals: MealEntry[];
  onToggle: (id: string) => void;
};

export default function TodaysMeals({ meals, onToggle }: Props) {
  return (
    <View className="mx-5 mt-5 bg-white rounded-3xl p-5">
      <Text className="font-bold text-[#2B2320] mb-1">Today's Meals</Text>
      <View>
        {meals.map((meal, index) => (
          <MealRow
            key={meal.id}
            meal={meal}
            onToggle={onToggle}
            isLast={index === meals.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
