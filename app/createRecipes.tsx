import React, { useState } from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";


export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "grid" | "profile">(
    "home"
  );


 


  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
