import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  goalLabel: string;
  dailyCalorieTarget: number | null;
  onPress: () => void;
};

export default function DailyGoalCard({ goalLabel, dailyCalorieTarget, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-5 mt-5 bg-white rounded-3xl p-4 flex-row items-center justify-between shadow-sm active:opacity-80"
    >
      <View className="flex-1">
        <Text className="font-bold text-[#2B2320] mb-1">Daily Goal</Text>
        <Text className="text-xs text-[#9C9088]">{goalLabel}</Text>
        <Text className="text-lg font-extrabold text-[#C85A3A] mt-1">
          {dailyCalorieTarget ? `${dailyCalorieTarget.toLocaleString()} kcal` : "Not set"}
        </Text>
      </View>
      <View className="w-10 h-10 rounded-full bg-[#FAF7F4] items-center justify-center">
        <Ionicons name="flag-outline" size={18} color="#C85A3A" />
      </View>
    </Pressable>
  );
}
