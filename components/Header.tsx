import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  name: string;
  subtitle: string;
  avatarUrl: string;
};

export default function Header({ name, subtitle, avatarUrl }: Props) {
  return (
    <View className="flex-row items-center px-5 pt-4">
      <Image
        source={{ uri: avatarUrl }}
        className="w-12 h-12 rounded-full bg-orange-100"
      />
      <View className="ml-3">
        <Text className="text-xl font-bold text-[#2B2320]">
          Hello, {name}!
        </Text>
        <Text className="text-xs text-[#9C9088] tracking-wide">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
