import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsRow from "../../components/settings/SettingsRow";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header
          name="Tom Riddle"
          email="@iwhamutnatbenamed@gmail.com"
          avatarUrl="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"
        />

        <SettingsSection title="Account">
          <SettingsRow label="Edit Profile" onPress={() => {}} />
          <SettingsRow label="Change Password" onPress={() => {}} />
          <SettingsRow
            label="Units"
            value="Metric (kg, g)"
            isLast
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            label="Daily Goal"
            value="2,000 kcal"
            onPress={() => {}}
          />
          <SettingsRow label="Reminders" value="On" isLast onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Help & Support" onPress={() => {}} />
          <SettingsRow label="Privacy Policy" onPress={() => {}} />
          <SettingsRow
            label="Terms of Service"
            isLast
            onPress={() => {}}
          />
        </SettingsSection>

        <View className="mx-5 mt-6 bg-white rounded-2xl overflow-hidden">
          <SettingsRow
            label="Log Out"
            danger
            showChevron={false}
            isLast
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
