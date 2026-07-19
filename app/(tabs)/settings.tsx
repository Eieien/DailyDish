import React, { useState } from "react";
import { View, ScrollView, StatusBar, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsRow from "../../components/settings/SettingsRow";
import EditFieldModal from "../../components/settings/EditFieldModal";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal";
import InfoModal from "../../components/settings/InfoModal";

import { useUserProfile } from "../hooks/useUserProfile";
import { updateUserLocal } from "../powersync/writes";
import { colors } from "@/constants/theme";
import { Alert } from "@/lib/alert";

const PLACEHOLDER_HELP =
  "This is placeholder Help & Support content. Replace this with real support instructions (contact email, FAQ, or a link to a help center) before shipping.";
const PLACEHOLDER_PRIVACY =
  "This is placeholder Privacy Policy content. Replace this with your actual privacy policy before shipping.";
const PLACEHOLDER_TERMS =
  "This is placeholder Terms of Service content. Replace this with your actual terms before shipping.";

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const userProfile = useUserProfile(clerkUser?.id);

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [infoModal, setInfoModal] = useState<"help" | "privacy" | "terms" | null>(null);
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const onLogOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  const saveName = async (value: string) => {
    if (!clerkUser?.id || !value.trim()) return;
    setSaving(true);
    try {
      await updateUserLocal(clerkUser.id, { name: value.trim() });
      setNameModalVisible(false);
    } catch {
      Alert.alert("Failed to update name", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onPressUnits = () => {
    if (!clerkUser?.id) return;
    Alert.alert("Units", "Choose your preferred units", [
      {
        text: "Metric (kg, g)",
        onPress: () => updateUserLocal(clerkUser.id, { units: "metric" }),
      },
      {
        text: "Imperial (lb, oz)",
        onPress: () => updateUserLocal(clerkUser.id, { units: "imperial" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center gap-3 px-4 pt-2">
        <Pressable
          onPress={goBack}
          hitSlop={12}
          className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text className="font-bold text-lg text-[#2B2320]">Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header
          name={userProfile?.name ?? "Loading.."}
          email={clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
        />

        <SettingsSection title="Account">
          <SettingsRow label="Edit Profile" onPress={() => setNameModalVisible(true)} />
          <SettingsRow
            label="Change Password"
            onPress={() => setPasswordModalVisible(true)}
          />
          <SettingsRow
            label="Units"
            value={userProfile?.units === "imperial" ? "Imperial (lb, oz)" : "Metric (kg, g)"}
            isLast
            onPress={onPressUnits}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Help & Support" onPress={() => setInfoModal("help")} />
          <SettingsRow label="Privacy Policy" onPress={() => setInfoModal("privacy")} />
          <SettingsRow
            label="Terms of Service"
            isLast
            onPress={() => setInfoModal("terms")}
          />
        </SettingsSection>

        <View className="mx-5 mt-6 bg-white rounded-2xl overflow-hidden">
          <SettingsRow
            label="Log Out"
            danger
            showChevron={false}
            isLast
            onPress={onLogOut}
          />
        </View>
      </ScrollView>

      <EditFieldModal
        visible={nameModalVisible}
        title="Edit Profile"
        label="Name"
        initialValue={userProfile?.name ?? ""}
        saving={saving}
        onClose={() => setNameModalVisible(false)}
        onSave={saveName}
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <InfoModal
        visible={infoModal === "help"}
        title="Help & Support"
        body={PLACEHOLDER_HELP}
        onClose={() => setInfoModal(null)}
      />
      <InfoModal
        visible={infoModal === "privacy"}
        title="Privacy Policy"
        body={PLACEHOLDER_PRIVACY}
        onClose={() => setInfoModal(null)}
      />
      <InfoModal
        visible={infoModal === "terms"}
        title="Terms of Service"
        body={PLACEHOLDER_TERMS}
        onClose={() => setInfoModal(null)}
      />
    </SafeAreaView>
  );
}
