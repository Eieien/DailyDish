import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: string;
  subtitle?: string;
  email?: string;
  onPressAvatar?: () => void;
};

export default function Header({ name, subtitle, email, onPressAvatar }: Props) {
  const avatar = (
    <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
      <Ionicons name="person" size={24} color="#D2601A" />
    </View>
  );

  return (
    <View className="flex-row items-center px-5 pt-4">
      {onPressAvatar ? (
        <Pressable onPress={onPressAvatar} hitSlop={8}>
          {avatar}
        </Pressable>
      ) : (
        avatar
      )}
      <View className="ml-3">
        <Text className="text-xl font-bold text-[#2B2320]">
          Hello, {name}!
        </Text>
        {subtitle ? (
          <Text className="text-xs text-[#9C9088] tracking-wide">
            {subtitle}
          </Text>
        ) : null}
        {email ? (
          <Text className="text-xs text-[#9C9088] tracking-wide">
            {email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
