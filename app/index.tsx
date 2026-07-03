import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";

import HomeHeader from "@/components/HomeHeader";
import SearchBar from "@/components/SearchBar";
import CategoryList from "@/components/CategoryList";
import RecipeSection from "@/components/RecipeSection";

export default function Home() {
  return (
    <View className="flex-1 bg-[#FAF7F4]">

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView>

        <HomeHeader />

        <CategoryList />

        <RecipeSection title="Breakfast Recipes" />

      </ScrollView>

    </View>
  );
}