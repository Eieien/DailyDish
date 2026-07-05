import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabKey = "home" | "calendar" | "grid" | "profile";

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabs: { key: TabKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", icon: "home" },
  { key: "calendar", icon: "calendar-outline" },
  { key: "grid", icon: "grid-outline" },
  { key: "profile", icon: "person-outline" },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-around bg-white rounded-3xl mx-8 mb-4 py-3 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              isActive ? "bg-[#D2601A]" : ""
            }`}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? "#FFFFFF" : "#9C9088"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
