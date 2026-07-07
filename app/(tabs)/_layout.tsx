import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs tabBar={() => null}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          title: "Recipe",
          // headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          // headerShown: false,
        }}
      />
    </Tabs>
  );
}
