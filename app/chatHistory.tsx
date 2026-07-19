import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import { listSessions, type SessionRow } from "./lib/sessions";
import { colors } from "@/constants/theme";

function formatSessionDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
          const rows = await listSessions(userId);
          setSessions(rows);
        } catch (error) {
          console.log("Failed to load chat history:", error);
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
      router.replace("/chat");
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
        <Text className="font-urbanist-bold text-lg text-ink">Chat History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : sessions.length === 0 ? (
          <View className="items-center rounded-3xl bg-surface p-8 mt-4">
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.muted} />
            <Text className="mt-3 text-center font-urbanist text-sm text-muted">
              No past conversations yet. Start a new chat to see it show up here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => router.push(`/chat?sessionId=${session.id}`)}
              className="mb-3 rounded-3xl bg-surface p-4 shadow-sm active:opacity-80">
              <Text className="font-urbanist-bold text-base text-ink" numberOfLines={1}>
                {session.title}
              </Text>
              <Text className="mt-1 font-urbanist text-xs text-muted">
                {formatSessionDate(session.updatedAt)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
