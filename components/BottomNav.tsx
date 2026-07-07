import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type TabKey = "home" | "calendar" | "grid" | "profile";
// type PageRoute = typeof tabs[number]["page"];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

// const tabs: { key: TabKey; icon: keyof typeof Ionicons.glyphMap; page: PageRoute }[] = [
//   { key: "home", icon: "home", page: "/(tabs)" },
//   { key: "calendar", icon: "calendar-outline", page: "/(tabs)/progress" },
//   { key: "grid", icon: "grid-outline", page: "/(tabs)/recipe" },
//   { key: "profile", icon: "person-outline", page: "/(tabs)/settings" },
// ];

const tabs = [
  { key: "home", icon: "home", page: "/(tabs)" },
  { key: "calendar", icon: "calendar-outline", page: "/(tabs)/progress" },
  { key: "grid", icon: "grid-outline", page: "/(tabs)/recipe" },
  { key: "profile", icon: "person-outline", page: "/(tabs)/settings" },
] as const;

type PageRoute = typeof tabs[number]["page"];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-around bg-white rounded-3xl mx-8 mb-4 py-3 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {onChange(tab.key), router.replace(tab.page as any);}}
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
