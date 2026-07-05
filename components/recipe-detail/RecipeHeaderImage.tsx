import React from "react";
import { View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  imageUrl: string;
};

export default function RecipeHeaderImage({ imageUrl }: Props) {
  const router = useRouter();

  return (
    <View className="h-64 w-full">
      <Image source={{ uri: imageUrl }} className="w-full h-full" />
      <Pressable
        onPress={() => router.back()}
        className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={20} color="#2B2320" />
      </Pressable>
    </View>
  );
}
