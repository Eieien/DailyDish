import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter?: () => void;
};

export default function SearchBar({ value, onChangeText, onPressFilter }: Props) {
  return (
    <View className="flex-row items-center px-5 mt-4">
      <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 h-12 border border-[#F0E4DA]">
        <Ionicons name="search" size={18} color="#9C9088" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search"
          placeholderTextColor="#9C9088"
          className="ml-2 flex-1 text-[#2B2320]"
        />
      </View>
      <Pressable
        onPress={onPressFilter}
        className="w-12 h-12 rounded-2xl bg-[#D2601A] items-center justify-center ml-3"
      >
        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
