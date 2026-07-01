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
    </Tabs>
  );
}
