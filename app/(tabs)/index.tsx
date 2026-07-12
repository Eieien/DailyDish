import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";

import Header from "../../components/Header";
import DailyRecapCard from "../../components/DailyRecapCard";
import CaloriesSummary from "../../components/CaloriesSummary";
import TodaysMeals from "../../components/TodaysMeals";
import RecipesSection from "../../components/RecipesSection";
import BottomNav from "../../components/BottomNav";
import AskAIButton from "../../components/AskAIButton";
import AddMealModal from "../../components/meal/AddMealModal";

import { dailyProgress as goalDefaults } from "../../data/mockData";
import { Recipe, DailyProgress } from "../../data/types";
import { getUser, postUsers } from "../lib/user";
import { setUser } from "../store/user";
import { getMealsForDate, setMealCompleted, deleteMeal, toMealEntry, type MealRow } from "../lib/meals";
import { getRecipes, toRecipeCardData } from "../lib/recipes";
import { DEFAULT_AVATAR } from "@/constants/theme";
import { Alert } from "@/lib/alert";

export default function HomeScreen() {
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const { user: clerkUser } = useUser();
  const userProfile = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const [mealRows, setMealRows] = useState<MealRow[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        if (!userId) return;
        try {
          let profile = await getUser(userId);
          if (!profile) {
            const fallbackName = clerkUser?.fullName || clerkUser?.firstName || "there";
            profile = await postUsers({ id: userId, name: fallbackName });
          }
          dispatch(setUser(profile));
        } catch (error) {
          console.log("Failed to load user profile:", error);
        }
      };
      loadUser();
    }, [userId, clerkUser, dispatch])
  );

  useFocusEffect(
    useCallback(() => {
      const loadMeals = async () => {
        if (!userId) return;
        try {
          const rows = await getMealsForDate(userId);
          setMealRows(rows);
        } catch (error) {
          console.log("Failed to load meals:", error);
        }
      };
      loadMeals();
    }, [userId])
  );

  useFocusEffect(
    useCallback(() => {
      const loadRecipes = async () => {
        if (!userId) return;
        try {
          const rows = await getRecipes(userId);
          setRecipes(rows.map(toRecipeCardData));
        } catch (error) {
          console.log("Failed to load recipes:", error);
        }
      };
      loadRecipes();
    }, [userId])
  );

  const meals = useMemo(() => mealRows.map(toMealEntry), [mealRows]);

  const progress: DailyProgress = useMemo(() => {
    const eaten = mealRows.filter((m) => m.completed);
    const foodCalories = eaten.reduce(
      (sum, m) => sum + (m.calories ?? m.nutritions?.calories ?? 0),
      0
    );
    const protein = eaten.reduce((sum, m) => sum + (m.nutritions?.protein ?? 0), 0);
    const fat = eaten.reduce((sum, m) => sum + (m.nutritions?.fat ?? 0), 0);
    const carbs = eaten.reduce((sum, m) => sum + (m.nutritions?.carbs ?? 0), 0);

    return {
      goalCalories: userProfile?.dailyCalorieTarget ?? goalDefaults.goalCalories,
      foodCalories,
      protein: { current: protein, goal: goalDefaults.protein.goal },
      fat: { current: fat, goal: goalDefaults.fat.goal },
      carbs: { current: carbs, goal: goalDefaults.carbs.goal },
    };
  }, [mealRows, userProfile]);

  const toggleMeal = useCallback(
    async (id: string) => {
      const target = mealRows.find((m) => m.id === id);
      if (!target) return;
      const nextCompleted = !target.completed;

      setMealRows((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: nextCompleted } : m))
      );

      try {
        await setMealCompleted(id, nextCompleted);
      } catch {
        setMealRows((prev) =>
          prev.map((m) => (m.id === id ? { ...m, completed: !nextCompleted } : m))
        );
      }
    },
    [mealRows]
  );

  const onDeleteMeal = useCallback((id: string) => {
    const target = mealRows.find((m) => m.id === id);
    if (!target) return;

    Alert.alert("Remove meal?", `"${target.title}" will be removed from today's meals.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const previous = mealRows;
          setMealRows((prev) => prev.filter((m) => m.id !== id));
          try {
            await deleteMeal(id);
          } catch {
            setMealRows(previous);
            Alert.alert("Failed to remove meal", "Please try again.");
          }
        },
      },
    ]);
  }, [mealRows]);

  const openRecipe = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Header
            name={userProfile ? userProfile.name : "Loading.."}
            subtitle="BLABLABLALA"
            avatarUrl={userProfile?.avatarUrl ?? DEFAULT_AVATAR}
            onPressAvatar={() => router.push("/(tabs)/settings")}
            showCameraBadge={false}
          />

          <DailyRecapCard
            date="July 2, 2026"
            message="Great job! You're 750 kcal under your daily goal. Keep it up! 👍"
          />

          <CaloriesSummary progress={progress} />

          <TodaysMeals
            meals={meals}
            onToggle={toggleMeal}
            onDelete={onDeleteMeal}
            onAddMeal={() => setAddMealModalVisible(true)}
          />

          <RecipesSection
            title="My Recipes"
            recipes={recipes}
            onPressRecipe={openRecipe}
            onPressSeeAll={() => router.push("/(tabs)/recipe")}
          />
        </ScrollView>

        <AskAIButton onPress={() => router.push("/chat")} />

        <BottomNav />
      </View>

      <AddMealModal
        visible={addMealModalVisible}
        userId={userId}
        onClose={() => setAddMealModalVisible(false)}
        onAdded={(created) => setMealRows((prev) => [...prev, created])}
      />
    </SafeAreaView>
  );
}
