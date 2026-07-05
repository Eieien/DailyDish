import React from "react";
import { View, Text } from "react-native";
import { Ingredient } from "../../data/types";

type Props = {
  ingredients: Ingredient[];
};

export default function IngredientsCard({ ingredients }: Props) {
  return (
    <View className="mx-5 mt-4 bg-white rounded-3xl p-5">
      <Text className="font-bold text-[#2B2320] mb-3">Ingredients</Text>
      <View className="flex-row flex-wrap">
        {ingredients.map((ing) => (
          <View key={ing.id} style={{ width: "50%" }} className="flex-row items-center mb-2 pr-2">
            <View className="w-2.5 h-2.5 rounded-full bg-[#D2601A] mr-2" />
            <Text className="text-sm text-[#2B2320]">{ing.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
