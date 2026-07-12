import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import { getMealHistory, type DayHistory } from "./lib/meals";
import { colors } from "@/constants/theme";

function formatDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
          const data = await getMealHistory(userId, 30);
          setHistory(data);
        } catch (error) {
          console.log("Failed to load history:", error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [userId])
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/progress");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable
          onPress={goBack}
          hitSlop={12}
          className="h-9 w-9 items-center justify-center rounded-full bg-surface shadow-sm active:opacity-70">
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text className="font-urbanist-bold text-lg text-ink">History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : history.length === 0 ? (
          <View className="items-center rounded-3xl bg-surface p-8 mt-4">
            <Ionicons name="time-outline" size={26} color={colors.muted} />
            <Text className="mt-3 text-center font-urbanist text-sm text-muted">
              No meal history yet. Days with logged meals will show up here.
            </Text>
          </View>
        ) : (
          history.map((day) => (
            <Pressable
              key={day.date}
              onPress={() => router.push(`/(tabs)/progress?date=${day.date}`)}
              className="mb-3 rounded-3xl bg-surface p-4 shadow-sm active:opacity-80">
              <View className="flex-row items-center justify-between">
                <Text className="font-urbanist-bold text-base text-ink">
                  {formatDayLabel(day.date)}
                </Text>
                <Text className="font-urbanist-bold text-base text-primary">
                  {day.calories} kcal
                </Text>
              </View>
              <Text className="mt-1 font-urbanist text-xs text-muted">
                {day.mealCount} {day.mealCount === 1 ? "meal" : "meals"} · {day.protein}g P ·{" "}
                {day.fat}g F · {day.carbs}g C
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
