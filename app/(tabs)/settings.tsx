import React, { useState, useEffect } from "react";
import { View, ScrollView, StatusBar, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";

import BottomNav from "../../components/BottomNav";
import AskAIButton from "../../components/AskAIButton";

import { dailyProgress, todaysMeals, recipes } from "../../data/mockData";
import { Recipe } from "../../data/types";
import { MealEntry } from "../../data/types";
import { getUsers } from "../lib/user";

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [meals, setMeals] = useState<MealEntry[]>(todaysMeals);
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "grid" | "profile">(
    "home"
  );
  const {signOut, isSignedIn} = useClerk();

  const toggleMeal = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const openRecipe = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

//    useEffect(() => {
        
//     }, [isSignedIn]);
    if(!isSignedIn){
            console.log("back to sign in")
            router.replace('/sign-in');
        }
  

  // const [users, setUsers] = useState<any[]>([]);
  // const fetchUsers = async () => {
  //   const data = await getUsers(); // Expo Router resolves this internally
  //   setUsers(data);
  // };
  // fetchUsers();
  // console.log(users);


  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Pressable onPress={() => {signOut(), console.log("logging out"), router.replace('/settings');}}> 
            {/* requiring 2 press = 2 reloads 
            perhaps clerk takes some time to operate  */}
            <Text> Log out</Text>
          </Pressable>

        </ScrollView>

        <AskAIButton onPress={() => router.push("/chat")} />

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
