import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import Svg, { Circle } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import BottomNav from "../../components/BottomNav";
import MealEditModal from "../../components/meal/MealEditModal";
import AddMealModal from "../../components/meal/AddMealModal";
import { ImageOrPlaceholder } from "../../components/ui/ImageOrPlaceholder";

import { localIsoDate } from "../_lib/meals";
import { setMealCompletedLocal } from "../_powersync/writes";
import { useUserProfile } from "../_hooks/useUserProfile";
import { useMealsForDate } from "../_hooks/useMealsForDate";
import { dailyProgress as goalDefaults } from "../../data/mockData";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHeaderDate(date: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    dateString: `${months[date.getMonth()]} ${date.getDate()}`,
    dayString: daysOfWeek[date.getDay()],
  };
}

function parseIsoDate(iso?: string): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export default function ProgressScreen() {
  const router = useRouter();
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const userProfile = useUserProfile(userId);
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();

  const [selectedDate, setSelectedDate] = useState(() => parseIsoDate(dateParam) ?? new Date());
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);

  // Sync selectedDate when the ?date= param changes (e.g. navigating in from
  // History while this screen is already mounted). Adjusted during render,
  // per React's guidance, rather than in an effect.
  const [syncedDateParam, setSyncedDateParam] = useState(dateParam);
  if (dateParam !== syncedDateParam) {
    setSyncedDateParam(dateParam);
    const parsed = parseIsoDate(dateParam);
    if (parsed) setSelectedDate(parsed);
  }

  const mealRows = useMealsForDate(userId, localIsoDate(selectedDate));

  const loggedMeals = mealRows.filter((m) => m.completed);
  const pendingMeals = mealRows.filter((m) => !m.completed);

  const totalTargetCalories = userProfile?.dailyCalorieTarget ?? goalDefaults.goalCalories;
  const consumedCalories = loggedMeals.reduce(
    (acc, m) => acc + (m.calories ?? m.nutritions?.calories ?? 0),
    0
  );
  const remainingCalories = Math.max(0, totalTargetCalories - consumedCalories);
  const progressPct = Math.min(1, consumedCalories / totalTargetCalories);

  const totalProtein = loggedMeals.reduce((acc, m) => acc + (m.nutritions?.protein ?? 0), 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + (m.nutritions?.fat ?? 0), 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + (m.nutritions?.carbs ?? 0), 0);

  const goalProtein = goalDefaults.protein.goal;
  const goalFat = goalDefaults.fat.goal;
  const goalCarbs = goalDefaults.carbs.goal;

  const shiftDate = (amount: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + amount);
      return next;
    });
  };

  const days = useMemo(() => {
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const arr = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      arr.push({ name: dayNames[d.getDay()], date: d.getDate(), fullDate: d });
    }
    return arr;
  }, [selectedDate]);

  const headerInfo = formatHeaderDate(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());

  const toggleMeal = async (id: string) => {
    const target = mealRows.find((m) => m.id === id);
    if (!target) return;
    await setMealCompletedLocal(id, !target.completed);
  };

  const r = 70;
  const size = 160;
  const strokeWidth = 14;
  const C = 2 * Math.PI * r;
  const visibleLength = (2 / 3) * C;
  const gapLength = (1 / 3) * C;
  const activeLength = progressPct * visibleLength;

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F4]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Top Row: Date Pill & Navigation Chevrons */}
          <View className="flex-row items-center justify-between px-5 pt-4">
            <View className="flex-row items-center bg-white rounded-full py-1.5 pl-2 pr-4 border border-[#EFE7E1] shadow-sm">
              <View className="w-9 h-9 rounded-full bg-[#C85A3A] items-center justify-center">
                <MaterialCommunityIcons name="calendar-edit" size={18} color="#fff" />
              </View>
              <View className="ml-2.5">
                <Text className="text-sm font-bold text-[#2B2320]">{headerInfo.dateString}</Text>
                <Text className="text-[10px] text-[#9C9088] font-medium">{headerInfo.dayString}</Text>
              </View>
            </View>

            <View className="flex-row" style={{ gap: 8 }}>
              <Pressable
                onPress={() => router.push("/history")}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE7E1] items-center justify-center shadow-sm active:opacity-70"
              >
                <Ionicons name="time-outline" size={16} color="#9C9088" />
              </Pressable>
              <Pressable
                onPress={() => shiftDate(-1)}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE7E1] items-center justify-center shadow-sm active:opacity-70"
              >
                <Ionicons name="chevron-back" size={16} color="#9C9088" />
              </Pressable>
              <Pressable
                onPress={() => shiftDate(1)}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE7E1] items-center justify-center shadow-sm active:opacity-70"
              >
                <Ionicons name="chevron-forward" size={16} color="#9C9088" />
              </Pressable>
            </View>
          </View>

          {/* Day Selector */}
          <View className="px-5 mt-6">
            <Text className="text-2xl font-bold text-[#2B2320] mb-4">
              {isToday ? "Today" : headerInfo.dateString}
            </Text>

            <View className="flex-row justify-between">
              {days.map((day) => {
                const isSelected = isSameDay(selectedDate, day.fullDate);
                return (
                  <Pressable
                    key={day.fullDate.toISOString()}
                    onPress={() => setSelectedDate(day.fullDate)}
                    className={`w-14 py-3 rounded-2xl items-center justify-center shadow-sm ${
                      isSelected
                        ? "bg-[#FDF3EC] border border-[#C85A3A]"
                        : "bg-white border border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold tracking-wider mb-1 ${
                        isSelected ? "text-[#C85A3A]" : "text-[#9C9088]"
                      }`}
                    >
                      {day.name}
                    </Text>
                    <Text className="text-lg font-extrabold text-[#2B2320]">{day.date}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Circular Gauge / Arc Progress */}
          <View className="items-center mt-8">
            <View style={{ width: size, height: size - 20 }} className="items-center justify-center">
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke="#EFE7E1"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${visibleLength} ${gapLength}`}
                  transform={`rotate(150 ${size / 2} ${size / 2})`}
                />
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke="#C85A3A"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${activeLength} ${C}`}
                  transform={`rotate(150 ${size / 2} ${size / 2})`}
                />
              </Svg>

              <View className="absolute items-center justify-center" style={{ top: 38 }}>
                <Text className="text-3xl font-extrabold text-[#2B2320]">{consumedCalories}</Text>
                <Text className="text-xs text-[#9C9088] font-medium mt-0.5">Consumed</Text>
              </View>
            </View>

            <View className="flex-row justify-between w-64 mt-1 px-4">
              <View className="items-center">
                <Text className="text-sm font-extrabold text-[#2B2320]">{remainingCalories}</Text>
                <Text className="text-[10px] text-[#9C9088] font-medium">Remaining</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm font-extrabold text-[#2B2320]">{totalTargetCalories}</Text>
                <Text className="text-[10px] text-[#9C9088] font-medium">Target</Text>
              </View>
            </View>
          </View>

          {/* Macro Bars Card */}
          <View
            className="mx-5 mt-8 bg-white rounded-3xl p-5 border border-[#EFE7E1] shadow-sm flex-row justify-between"
            style={{ gap: 12 }}
          >
            <View className="flex-1">
              <Text className="text-xs text-[#9C9088] font-semibold mb-2">Protein</Text>
              <View className="h-2.5 bg-[#FAF7F4] rounded-full overflow-hidden mb-2">
                <View
                  style={{ width: `${Math.min(100, (totalProtein / goalProtein) * 100)}%` }}
                  className="h-full rounded-full bg-[#C85A3A]"
                />
              </View>
              <Text className="text-xs font-extrabold text-[#2B2320]">
                {totalProtein}/{goalProtein}g
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#9C9088] font-semibold mb-2">Fat</Text>
              <View className="h-2.5 bg-[#FAF7F4] rounded-full overflow-hidden mb-2">
                <View
                  style={{ width: `${Math.min(100, (totalFat / goalFat) * 100)}%` }}
                  className="h-full rounded-full bg-[#D4A844]"
                />
              </View>
              <Text className="text-xs font-extrabold text-[#2B2320]">
                {totalFat}/{goalFat}g
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-[#9C9088] font-semibold mb-2">Carbs</Text>
              <View className="h-2.5 bg-[#FAF7F4] rounded-full overflow-hidden mb-2">
                <View
                  style={{ width: `${Math.min(100, (totalCarbs / goalCarbs) * 100)}%` }}
                  className="h-full rounded-full bg-[#7A2E3F]"
                />
              </View>
              <Text className="text-xs font-extrabold text-[#2B2320]">
                {totalCarbs}/{goalCarbs}g
              </Text>
            </View>
          </View>

          {/* Logged Meals Section */}
          <View className="px-5 mt-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-extrabold text-[#2B2320]">
                {isToday ? "Today's Meals" : "Logged Meals"}
              </Text>
              {isToday ? (
                <Pressable
                  onPress={() => setAddMealModalVisible(true)}
                  hitSlop={8}
                  className="w-8 h-8 rounded-full bg-[#D2601A] items-center justify-center shadow-sm active:opacity-80"
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </Pressable>
              ) : null}
            </View>

            {loggedMeals.length === 0 ? (
              <View className="bg-white rounded-3xl p-6 border border-[#EFE7E1] items-center justify-center mb-4 shadow-sm">
                <Ionicons name="restaurant-outline" size={24} color="#9C9088" style={{ marginBottom: 8 }} />
                <Text className="text-xs text-[#9C9088] font-medium text-center">
                  No meals logged for this day yet.
                </Text>
              </View>
            ) : (
              loggedMeals.map((meal) => (
                <View
                  key={meal.id}
                  className="flex-row items-center bg-white rounded-3xl p-4 mb-3 border border-[#EFE7E1] shadow-sm"
                >
                  <Pressable onPress={() => toggleMeal(meal.id)} className="flex-row items-center flex-1">
                    <ImageOrPlaceholder
                      uri={meal.imageUrl}
                      className="w-14 h-14 rounded-2xl bg-[#FAF7F4]"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-[10px] text-[#9C9088] font-bold mb-0.5">
                        {meal.category ?? "Meal"}
                      </Text>
                      <Text className="text-base font-extrabold text-[#2B2320] mb-0.5">
                        {meal.title}
                      </Text>
                      <Text className="text-xs text-[#9C9088] font-medium">
                        {meal.calories ?? meal.nutritions?.calories ?? 0} kcal
                        {meal.nutritions
                          ? ` · ${meal.nutritions.protein}g P, ${meal.nutritions.carbs}g C, ${meal.nutritions.fat}g F`
                          : ""}
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditingMealId(meal.id)}
                    hitSlop={8}
                    className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-[#FAF7F4]"
                  >
                    <Ionicons name="pencil" size={14} color="#9C9088" />
                  </Pressable>

                  <Pressable
                    onPress={() => toggleMeal(meal.id)}
                    className="w-8 h-8 rounded-full bg-[#C85A3A]/10 items-center justify-center"
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#C85A3A" />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* Pending Meals Section */}
          {pendingMeals.length > 0 && (
            <View className="px-5 mt-4">
              <Text className="text-lg font-extrabold text-[#2B2320] mb-3">Not Yet Logged</Text>

              {pendingMeals.map((meal) => (
                <View
                  key={meal.id}
                  className="flex-row items-center bg-white/60 rounded-3xl p-4 mb-3 border border-[#EFE7E1]"
                  style={{ opacity: 0.8 }}
                >
                  <Pressable onPress={() => toggleMeal(meal.id)} className="flex-row items-center flex-1">
                    <ImageOrPlaceholder
                      uri={meal.imageUrl}
                      className="w-14 h-14 rounded-2xl bg-[#FAF7F4]"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-[10px] text-[#9C9088] font-bold mb-0.5">
                        {meal.category ?? "Meal"}
                      </Text>
                      <Text className="text-base font-extrabold text-[#2B2320] mb-0.5">
                        {meal.title}
                      </Text>
                      <Text className="text-xs text-[#9C9088] font-medium">
                        {meal.calories ?? meal.nutritions?.calories ?? 0} kcal · Tap to log
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditingMealId(meal.id)}
                    hitSlop={8}
                    className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-white"
                  >
                    <Ionicons name="pencil" size={14} color="#9C9088" />
                  </Pressable>

                  <Pressable
                    onPress={() => toggleMeal(meal.id)}
                    className="w-8 h-8 rounded-full bg-white border border-[#EFE7E1] items-center justify-center"
                  >
                    <Ionicons name="add" size={18} color="#9C9088" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <BottomNav />
      </View>

      <MealEditModal
        visible={editingMealId !== null}
        meal={mealRows.find((m) => m.id === editingMealId) ?? null}
        onClose={() => setEditingMealId(null)}
        onSaved={() => setEditingMealId(null)}
      />

      <AddMealModal
        visible={addMealModalVisible}
        userId={userId}
        onClose={() => setAddMealModalVisible(false)}
        onAdded={() => setAddMealModalVisible(false)}
      />
    </SafeAreaView>
  );
}
