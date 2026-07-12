import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: string;
  subtitle?: string;
  email?: string;
  avatarUrl: string;
  onPressAvatar?: () => void;
  showCameraBadge?: boolean;
};

export default function Header({
  name,
  subtitle,
  email,
  avatarUrl,
  onPressAvatar,
  showCameraBadge = true,
}: Props) {
  const avatar = (
    <View>
      <Image
        source={{ uri: avatarUrl }}
        className="w-12 h-12 rounded-full bg-orange-100"
      />
      {onPressAvatar && showCameraBadge ? (
        <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C85A3A] items-center justify-center border-2 border-white">
          <Ionicons name="camera" size={10} color="#FFFFFF" />
        </View>
      ) : null}
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
