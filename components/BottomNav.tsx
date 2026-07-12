import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const tabs = [
  { key: "home", icon: "home", path: "/(tabs)", pathnames: ["/", "/(tabs)", "/(tabs)/index"] },
  {
    key: "calendar",
    icon: "calendar-outline",
    path: "/(tabs)/progress",
    pathnames: ["/progress", "/(tabs)/progress"],
  },
  {
    key: "grid",
    icon: "grid-outline",
    path: "/(tabs)/recipe",
    pathnames: ["/recipe", "/(tabs)/recipe"],
  },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-row items-center justify-around bg-white rounded-3xl mx-8 mb-4 py-3 shadow-sm">
      {tabs.map((tab) => {
        const isActive = (tab.pathnames as readonly string[]).includes(pathname);
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.replace(tab.path as any)}
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
