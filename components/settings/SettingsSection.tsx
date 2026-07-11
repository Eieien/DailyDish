import React from "react";
import { View, Text } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
  return (
    <View className="mx-5 mt-6">
      <Text className="text-sm font-bold text-[#2B2320] mb-2">{title}</Text>
      <View className="bg-white rounded-2xl overflow-hidden">{children}</View>
    </View>
  );
}
