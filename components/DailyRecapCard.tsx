import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  date: string;
  message: string;
};

export default function DailyRecapCard({ date, message }: Props) {
  return (
    <View className="mx-5 mt-5 bg-[#F7D9C4] rounded-3xl p-4 flex-row items-center justify-between overflow-hidden">
      <View className="flex-1 pr-3">
        <Text className="font-bold text-[#2B2320] mb-1">Daily Recap</Text>
        <Text className="text-xs text-[#8A6A55] mb-2">{date}</Text>
        <Text className="text-sm text-[#4A3B31] leading-5">{message}</Text>
      </View>
      <View className="w-14 h-14 rounded-full bg-[#D2601A] items-center justify-center">
        <Ionicons name="happy-outline" size={28} color="#FFFFFF" />
      </View>
    </View>
  );
}
