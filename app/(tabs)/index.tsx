import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";

import Header from "../../components/Header";
import DailyRecapCard from "../../components/DailyRecapCard";
import DailyGoalCard from "../../components/DailyGoalCard";
import CaloriesSummary from "../../components/CaloriesSummary";
import TodaysMeals from "../../components/TodaysMeals";
import RecipesSection from "../../components/RecipesSection";
import BottomNav from "../../components/BottomNav";
import AddMealModal from "../../components/meal/AddMealModal";
import ScanFoodModal from "../../components/meal/ScanFoodModal";
import { GoalPickerModal, goalLabel } from "../../components/goal/GoalPickerModal";

import { dailyProgress as goalDefaults } from "../../data/mockData";
import { Recipe, DailyProgress } from "../../data/types";
import { getUser, postUsers } from "../lib/user";
import { toMealEntry } from "../lib/meals";
import { toRecipeCardData } from "../lib/recipes";
import { setMealCompletedLocal, deleteMealLocal, updateUserLocal } from "../powersync/writes";
import { useUserProfile } from "../hooks/useUserProfile";
import { useMealsForDate } from "../hooks/useMealsForDate";
import { useRecipes } from "../hooks/useRecipes";
import { Alert } from "@/lib/alert";

export default function HomeScreen() {
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const [scanMealModalVisible, setScanMealModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const userProfile = useUserProfile(userId);
  const mealRows = useMealsForDate(userId);
  const recipeRows = useRecipes(userId);
  const recipes = useMemo(() => recipeRows.map(toRecipeCardData), [recipeRows]);

  // One-time bootstrap: ensures a "user" row exists server-side so PowerSync's
  // sync rules (which key off it) have something to replicate down. Runs once
  // per sign-in, independent of the reactive profile read above.
  useEffect(() => {
    const ensureUser = async () => {
      if (!userId) return;
      try {
        const profile = await getUser(userId);
        if (!profile) {
          const fallbackName = clerkUser?.fullName || clerkUser?.firstName || "there";
          await postUsers({ id: userId, name: fallbackName });
        }
      } catch (error) {
        console.log("Failed to ensure user profile:", error);
      }
    };
    ensureUser();
  }, [userId, clerkUser]);

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
      // Writes land in local SQLite immediately, so the watched query above
      // reflects this instantly (offline included) — no manual optimistic
      // state or rollback needed.
      await setMealCompletedLocal(id, !target.completed);
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
        onPress: () => deleteMealLocal(id),
      },
    ]);
  }, [mealRows]);

  const openRecipe = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const onSaveGoal = async (goalId: string, calories: number) => {
    if (!userId) return;
    setSavingGoal(true);
    try {
      await updateUserLocal(userId, { dietGoal: goalId, dailyCalorieTarget: calories });
      setGoalModalVisible(false);
    } catch {
      Alert.alert("Failed to save goal", "Please try again.");
    } finally {
      setSavingGoal(false);
    }
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
            onPressAvatar={() => router.push("/(tabs)/settings")}
          />

          <DailyRecapCard
            date="July 2, 2026"
            message="Great job! You're 750 kcal under your daily goal. Keep it up! 👍"
          />

          <DailyGoalCard
            goalLabel={goalLabel(userProfile?.dietGoal ?? null)}
            dailyCalorieTarget={userProfile?.dailyCalorieTarget ?? null}
            onPress={() => setGoalModalVisible(true)}
          />

          <CaloriesSummary progress={progress} />

          <TodaysMeals
            meals={meals}
            onToggle={toggleMeal}
            onDelete={onDeleteMeal}
            onAddMeal={() => setAddMealModalVisible(true)}
            onScanMeal={() => setScanMealModalVisible(true)}
          />

          <RecipesSection
            title="My Recipes"
            recipes={recipes}
            onPressRecipe={openRecipe}
            onPressSeeAll={() => router.push("/(tabs)/recipe")}
          />
        </ScrollView>

        <BottomNav />
      </View>

      <AddMealModal
        visible={addMealModalVisible}
        userId={userId}
        onClose={() => setAddMealModalVisible(false)}
        onAdded={() => setAddMealModalVisible(false)}
      />

      <ScanFoodModal
        visible={scanMealModalVisible}
        userId={userId}
        onClose={() => setScanMealModalVisible(false)}
        onAdded={() => setScanMealModalVisible(false)}
      />

      <GoalPickerModal
        visible={goalModalVisible}
        initialGoalId={userProfile?.dietGoal ?? null}
        initialCalories={userProfile?.dailyCalorieTarget ?? null}
        saving={savingGoal}
        onClose={() => setGoalModalVisible(false)}
        onSave={onSaveGoal}
      />
    </SafeAreaView>
  );
}
