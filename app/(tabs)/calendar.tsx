import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Rect } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import BottomNav from "../../components/BottomNav";

// Import the mock data
import { dailyProgress, todaysMeals } from "../../data/mockData";

// Helper to format date keys (YYYY-MM-DD) for dictionary lookup
const getFormattedKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Base enhanced meals with protein, carbs, fat, and time slots
  const baseEnhancedMeals = (() => {
    const macrosMap: Record<string, { protein: number; carbs: number; fat: number; time: string }> = {
      m1: { protein: 12, carbs: 10, fat: 10, time: "8:00 AM" }, // Tortang Talong
      m2: { protein: 22, carbs: 2, fat: 10, time: "12:30 PM" }, // Bangus
      m3: { protein: 24, carbs: 1, fat: 9, time: "7:00 PM" },  // Lechon Manok
      m4: { protein: 6, carbs: 8, fat: 14, time: "4:00 PM" },   // Almonds
    };

    return todaysMeals.map((meal) => ({
      ...meal,
      ...macrosMap[meal.id] || { protein: 10, carbs: 10, fat: 10, time: "12:00 PM" },
    }));
  })();

  // Seed initial meals state per day to show variations between dates initially
  const [mealsByDate, setMealsByDate] = useState(() => {
    const initialMap: Record<string, typeof baseEnhancedMeals> = {};
    const today = new Date();
    
    // Today: Tortang Talong and Bangus completed by default
    initialMap[getFormattedKey(today)] = baseEnhancedMeals;

    // Yesterday: Tortang Talong, Bangus, and Lechon Manok completed
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    initialMap[getFormattedKey(yesterday)] = baseEnhancedMeals.map((m) =>
      m.id === "m1" || m.id === "m2" || m.id === "m3" ? { ...m, completed: true } : m
    );

    // Day before yesterday: All completed (100% progress)
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);
    initialMap[getFormattedKey(dayBefore)] = baseEnhancedMeals.map((m) => ({ ...m, completed: true }));

    // Tomorrow: All pending
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    initialMap[getFormattedKey(tomorrow)] = baseEnhancedMeals.map((m) => ({ ...m, completed: false }));

    // Day after tomorrow: All pending
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    initialMap[getFormattedKey(dayAfter)] = baseEnhancedMeals.map((m) => ({ ...m, completed: false }));

    return initialMap;
  });

  // Lookup meals for the currently selected date (fallback to empty pending list)
  const selectedDateKey = getFormattedKey(selectedDate);
  const activeMeals = mealsByDate[selectedDateKey] || baseEnhancedMeals.map((m) => ({ ...m, completed: false }));

  const loggedMeals = activeMeals.filter((m) => m.completed);
  const pendingMeals = activeMeals.filter((m) => !m.completed);

  // Calculate dynamic totals for the selected date
  const totalTargetCalories = dailyProgress.goalCalories; // 2000 kcal
  const consumedCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const remainingCalories = Math.max(0, totalTargetCalories - consumedCalories);
  const progressPct = consumedCalories / totalTargetCalories;

  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + m.fat, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);

  const goalProtein = dailyProgress.protein.goal; // 70g
  const goalFat = dailyProgress.fat.goal;       // 120g
  const goalCarbs = dailyProgress.carbs.goal;     // 40g

  // Helper to check if two Date objects are the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Helper to shift selectedDate by a given number of days
  const shiftDate = (amount: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + amount);
      return next;
    });
  };

  // Helper to format date for the top pill badge
  const formatHeaderDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    return {
      dateString: `${months[date.getMonth()]} ${date.getDate()}`,
      dayString: daysOfWeek[date.getDay()],
    };
  };

  // Dynamically generate 5 days: 2 days prior, today (present), 2 days after
  const getFiveDays = () => {
    const daysArray = [];
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();
    
    for (let i = -2; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      daysArray.push({
        name: dayNames[d.getDay()],
        date: d.getDate(),
        fullDate: d,
      });
    }
    return daysArray;
  };

  const days = getFiveDays();
  const headerInfo = formatHeaderDate(selectedDate);

  // Toggle meal completion handler (stores state per date key)
  const toggleMeal = (id: string) => {
    setMealsByDate((prev) => {
      const currentMeals = prev[selectedDateKey] || baseEnhancedMeals.map((m) => ({ ...m, completed: false }));
      const updatedMeals = currentMeals.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      );
      return {
        ...prev,
        [selectedDateKey]: updatedMeals,
      };
    });
  };

  // SVG Gauge variables
  const r = 70;
  const size = 160;
  const strokeWidth = 14;
  const C = 2 * Math.PI * r; // 439.8
  const visibleLength = (2 / 3) * C; // 293.2
  const gapLength = (1 / 3) * C; // 146.6
  const activeLength = progressPct * visibleLength;

  const handleTabChange = (tab: "home" | "calendar" | "grid" | "profile") => {
    if (tab === "home") {
      router.replace("/(tabs)");
    } else if (tab === "calendar") {
      // Already on calendar
    }
  };

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
            <Pressable className="flex-row items-center bg-white rounded-full py-1.5 pl-2 pr-4 border border-[#EFE7E1] shadow-sm">
              <View className="w-9 h-9 rounded-full bg-[#C85A3A] items-center justify-center">
                <MaterialCommunityIcons name="calendar-edit" size={18} color="#fff" />
              </View>
              <View className="ml-2.5">
                <Text className="text-sm font-bold text-[#2B2320]">{headerInfo.dateString}</Text>
                <Text className="text-[10px] text-[#9C9088] font-medium">{headerInfo.dayString}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9C9088" className="ml-2" />
            </Pressable>

            <View className="flex-row" style={{ gap: 8 }}>
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

          {/* Today Section & Days Selector */}
          <View className="px-5 mt-6">
            <Text className="text-2xl font-bold text-[#2B2320] mb-4">Today</Text>
            
            <View className="flex-row justify-between">
              {days.map((day) => {
                const isSelected = isSameDay(selectedDate, day.fullDate);
                return (
                  <Pressable
                    key={day.date}
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
                    <Text className="text-lg font-extrabold text-[#2B2320]">
                      {day.date}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Circular Gauge / Arc Progress */}
          <View className="items-center mt-8">
            <View style={{ width: size, height: size - 20 }} className="items-center justify-center">
              <Svg width={size} height={size}>
                {/* Background arc */}
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
                {/* Active progress arc */}
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

              {/* Central Text inside Gauge */}
              <View className="absolute items-center justify-center" style={{ top: 38 }}>
                <Text className="text-3xl font-extrabold text-[#2B2320]">
                  {consumedCalories}
                </Text>
                <Text className="text-xs text-[#9C9088] font-medium mt-0.5">Consumed</Text>
              </View>
            </View>

            {/* Labels below the Arc */}
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
          <View className="mx-5 mt-8 bg-white rounded-3xl p-5 border border-[#EFE7E1] shadow-sm flex-row justify-between" style={{ gap: 12 }}>
            {/* Protein */}
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

            {/* Fat */}
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

            {/* Carbs */}
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
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-extrabold text-[#2B2320]">Logged Meals</Text>
              <Pressable className="active:opacity-70">
                <Text className="text-sm font-bold text-[#C85A3A]">See all</Text>
              </Pressable>
            </View>

            {loggedMeals.length === 0 ? (
              <View className="bg-white rounded-3xl p-6 border border-[#EFE7E1] items-center justify-center mb-4 shadow-sm">
                <Ionicons name="restaurant-outline" size={24} color="#9C9088" className="mb-2" />
                <Text className="text-xs text-[#9C9088] font-medium text-center">
                  No meals logged for this day yet.{"\n"}Tap suggestions below to log them!
                </Text>
              </View>
            ) : (
              loggedMeals.map((meal) => (
                <Pressable
                  key={meal.id}
                  onPress={() => toggleMeal(meal.id)}
                  className="flex-row items-center bg-white rounded-3xl p-4 mb-3 border border-[#EFE7E1] shadow-sm active:opacity-90"
                >
                  {/* Checkerboard image placeholder */}
                  <View className="w-14 h-14 rounded-2xl bg-[#FAF7F4] overflow-hidden border border-[#EFE7E1] items-center justify-center">
                    <Svg width="56" height="56">
                      <Rect x="0" y="0" width="28" height="28" fill="#F4EDE6" />
                      <Rect x="28" y="0" width="28" height="28" fill="#FAF7F4" />
                      <Rect x="0" y="28" width="28" height="28" fill="#FAF7F4" />
                      <Rect x="28" y="28" width="28" height="28" fill="#F4EDE6" />
                    </Svg>
                  </View>

                  {/* Info */}
                  <View className="flex-1 ml-4">
                    <Text className="text-[10px] text-[#9C9088] font-bold mb-0.5">{meal.time}</Text>
                    <Text className="text-base font-extrabold text-[#2B2320] mb-0.5">{meal.recipeTitle}</Text>
                    <Text className="text-xs text-[#9C9088] font-medium">
                      {meal.calories} kcal · {meal.protein}g P, {meal.carbs}g C, {meal.fat}g F
                    </Text>
                  </View>

                  {/* Logged Indicator Check */}
                  <View className="w-8 h-8 rounded-full bg-[#C85A3A]/10 items-center justify-center">
                    <Ionicons name="checkmark-circle" size={20} color="#C85A3A" />
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Pending / Suggested Meals Section */}
          {pendingMeals.length > 0 && (
            <View className="px-5 mt-4">
              <Text className="text-lg font-extrabold text-[#2B2320] mb-3">Suggested for Today</Text>
              
              {pendingMeals.map((meal) => (
                <Pressable
                  key={meal.id}
                  onPress={() => toggleMeal(meal.id)}
                  className="flex-row items-center bg-white/60 rounded-3xl p-4 mb-3 border border-[#EFE7E1] active:opacity-90"
                  style={{ opacity: 0.7 }}
                >
                  <View className="w-14 h-14 rounded-2xl bg-[#FAF7F4] overflow-hidden border border-[#EFE7E1] items-center justify-center">
                    <Svg width="56" height="56">
                      <Rect x="0" y="0" width="28" height="28" fill="#F4EDE6" />
                      <Rect x="28" y="0" width="28" height="28" fill="#FAF7F4" />
                      <Rect x="0" y="28" width="28" height="28" fill="#FAF7F4" />
                      <Rect x="28" y="28" width="28" height="28" fill="#F4EDE6" />
                    </Svg>
                  </View>

                  <View className="flex-1 ml-4">
                    <Text className="text-[10px] text-[#9C9088] font-bold mb-0.5">{meal.slot}</Text>
                    <Text className="text-base font-extrabold text-[#2B2320] mb-0.5">{meal.recipeTitle}</Text>
                    <Text className="text-xs text-[#9C9088] font-medium">
                      {meal.calories} kcal · Tap to log
                    </Text>
                  </View>

                  <View className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#EFE7E1] items-center justify-center">
                    <Ionicons name="add" size={20} color="#9C9088" />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Robot AI Button */}
        <View className="absolute bottom-24 right-5 items-center z-50">
          <View className="flex-row mb-0.5" style={{ gap: 3 }}>
            <View className="w-0.5 h-1.5 bg-[#C85A3A] rounded-full transform -rotate-12" />
            <View className="w-0.5 h-2 bg-[#C85A3A] rounded-full" />
            <View className="w-0.5 h-1.5 bg-[#C85A3A] rounded-full transform rotate-12" />
          </View>
          
          <Pressable
            onPress={() => router.push("/chat")}
            className="w-14 h-14 rounded-full bg-[#C85A3A] items-center justify-center shadow-lg active:opacity-90 border border-white/20"
          >
            <MaterialCommunityIcons name="robot" size={28} color="#fff" />
          </Pressable>
          <Text className="text-[10px] font-extrabold text-[#C85A3A] mt-1 text-center bg-white/90 px-2 py-0.5 rounded-full border border-[#EFE7E1] shadow-sm">
            Ask DailyDish AI
          </Text>
        </View>

        {/* Bottom Navigation */}
        <BottomNav active="calendar" onChange={handleTabChange} />
      </View>
    </SafeAreaView>
  );
}
