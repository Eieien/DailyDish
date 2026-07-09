import React, { useState, useEffect } from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import DailyRecapCard from "../../components/DailyRecapCard";
import CaloriesSummary from "../../components/CaloriesSummary";
import TodaysMeals from "../../components/TodaysMeals";
import RecipesSection from "../../components/RecipesSection";
import BottomNav from "../../components/BottomNav";
import AskAIButton from "../../components/AskAIButton";

import { dailyProgress, todaysMeals, recipes } from "../../data/mockData";
import { Recipe } from "../../data/types";
import { MealEntry } from "../../data/types";
import { getUser } from "../lib/user";
import { setUser } from "../store/user";

export default function HomeScreen() {
  const { userId, isSignedIn, isLoaded, getToken } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const user = useSelector((state:any) => state.user.user);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [meals, setMeals] = useState<MealEntry[]>(todaysMeals);
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "grid" | "profile">(
    "home"
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      const user = await getUser(userId);
      console.log("user : ", user);
      dispatch(setUser(user));
    };
    if (userId) loadUser();
  }, [userId]);

  const toggleMeal = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const openRecipe = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  
  console.log("user session: ", user);

  return (
    
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Header
            name={user ?  user.name: "Loading.."}   //{user.name}
            subtitle="BLABLABLALA"
            avatarUrl="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"
          />

          <SearchBar
            value={search}
            onChangeText={setSearch}
            onPressFilter={() => {}}
          />

          <DailyRecapCard
            date="July 2, 2026"
            message="Great job! You're 750 kcal under your daily goal. Keep it up! 👍"
          />

          <CaloriesSummary progress={dailyProgress} />

          <TodaysMeals meals={meals} onToggle={toggleMeal} />

          <RecipesSection
            title="My Recipes"
            recipes={recipes}
            onPressRecipe={openRecipe}
            onPressSeeAll={() => {}}
          />
        </ScrollView>

        <AskAIButton onPress={() => router.push("/chat")} />

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
