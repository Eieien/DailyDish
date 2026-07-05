import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Macro } from "../../data/types";

type Props = {
  macros: Macro;
};

const stats: {
  key: keyof Macro;
  label: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "calories", label: "Calories", unit: "", icon: "flame-outline" },
  { key: "protein", label: "Protein", unit: "g", icon: "egg-outline" },
  { key: "fat", label: "Fat", unit: "g", icon: "water-outline" },
  { key: "carbs", label: "Carbs", unit: "g", icon: "leaf-outline" },
];

export default function NutritionStats({ macros }: Props) {
  return (
    <View className="flex-row justify-between px-5 mt-4">
      {stats.map((stat) => (
        <View
          key={stat.key}
          className="items-center bg-white rounded-2xl py-3 flex-1 mx-1"
        >
          <View className="w-9 h-9 rounded-full bg-[#F7D9C4] items-center justify-center mb-1">
            <Ionicons name={stat.icon} size={16} color="#D2601A" />
          </View>
          <Text className="font-bold text-[#2B2320]">
            {macros[stat.key]}
            {stat.unit}
          </Text>
          <Text className="text-[10px] text-[#9C9088]">{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}
