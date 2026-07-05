import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

export default function AskAIButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-24 right-5 bg-white rounded-full pl-3 pr-4 py-2 flex-row items-center shadow-md border border-[#F0E4DA]"
    >
      <View className="w-8 h-8 rounded-full bg-[#D2601A] items-center justify-center mr-2">
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
      </View>
      <Text className="text-[#2B2320] text-xs font-semibold">
        Ask DailyDish AI
      </Text>
    </Pressable>
  );
}
