import React, { useEffect, useState } from "react";
import { View, ScrollView, StatusBar, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import Header from "../../components/Header";
import SettingsSection from "../../components/settings/SettingsSection";
import SettingsRow from "../../components/settings/SettingsRow";
import EditFieldModal from "../../components/settings/EditFieldModal";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal";
import InfoModal from "../../components/settings/InfoModal";

import { getUser, updateUser, type UserProfile } from "../lib/user";
import { setUser } from "../store/user";
import { uploadImage } from "../lib/upload";
import { colors, DEFAULT_AVATAR } from "@/constants/theme";
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
  const dispatch = useDispatch();
  const userProfile: UserProfile | null = useSelector((state: any) => state.user.user);

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [infoModal, setInfoModal] = useState<"help" | "privacy" | "terms" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!clerkUser?.id || userProfile) return;
      const profile = await getUser(clerkUser.id);
      if (profile) dispatch(setUser(profile));
    };
    loadProfile();
  }, [clerkUser?.id, userProfile, dispatch]);

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
      const updated = await updateUser(clerkUser.id, { name: value.trim() });
      dispatch(setUser(updated));
      setNameModalVisible(false);
    } catch {
      Alert.alert("Failed to update name", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveDailyGoal = async (value: string) => {
    if (!clerkUser?.id) return;
    const numeric = parseInt(value, 10);
    if (Number.isNaN(numeric) || numeric <= 0) {
      Alert.alert("Invalid value", "Please enter a valid calorie number.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUser(clerkUser.id, { dailyCalorieTarget: numeric });
      dispatch(setUser(updated));
      setGoalModalVisible(false);
    } catch {
      Alert.alert("Failed to update goal", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onPressUnits = () => {
    if (!clerkUser?.id) return;
    Alert.alert("Units", "Choose your preferred units", [
      {
        text: "Metric (kg, g)",
        onPress: async () => {
          const updated = await updateUser(clerkUser.id, { units: "metric" });
          dispatch(setUser(updated));
        },
      },
      {
        text: "Imperial (lb, oz)",
        onPress: async () => {
          const updated = await updateUser(clerkUser.id, { units: "imperial" });
          dispatch(setUser(updated));
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onToggleReminders = async (value: boolean) => {
    if (!clerkUser?.id) return;
    dispatch(setUser({ ...userProfile, remindersEnabled: value }));
    try {
      const updated = await updateUser(clerkUser.id, { remindersEnabled: value });
      dispatch(setUser(updated));
    } catch {
      dispatch(setUser({ ...userProfile, remindersEnabled: !value }));
    }
  };

  const pickAndUploadAvatar = async (fromCamera: boolean) => {
    if (!clerkUser?.id) return;

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        `Permission to access the ${fromCamera ? "camera" : "media library"} is required.`
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (result.canceled) return;

    try {
      const url = await uploadImage(result.assets[0].uri, "avatars");
      const updated = await updateUser(clerkUser.id, { avatarUrl: url });
      dispatch(setUser(updated));
    } catch {
      Alert.alert("Failed to update photo", "Please try again.");
    }
  };

  const onPressAvatar = () => {
    Alert.alert("Change profile photo", "Choose a source", [
      { text: "Take Photo", onPress: () => pickAndUploadAvatar(true) },
      { text: "Choose from Library", onPress: () => pickAndUploadAvatar(false) },
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
          avatarUrl={userProfile?.avatarUrl ?? DEFAULT_AVATAR}
          onPressAvatar={onPressAvatar}
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

        <SettingsSection title="Preferences">
          <SettingsRow
            label="Daily Goal"
            value={
              userProfile?.dailyCalorieTarget
                ? `${userProfile.dailyCalorieTarget.toLocaleString()} kcal`
                : "Not set"
            }
            onPress={() => setGoalModalVisible(true)}
          />
          <SettingsRow
            label="Reminders"
            isLast
            switchValue={userProfile?.remindersEnabled ?? true}
            onSwitchChange={onToggleReminders}
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

      <EditFieldModal
        visible={goalModalVisible}
        title="Daily Goal"
        label="Daily calorie target (kcal)"
        initialValue={userProfile?.dailyCalorieTarget?.toString() ?? ""}
        keyboardType="number-pad"
        saving={saving}
        onClose={() => setGoalModalVisible(false)}
        onSave={saveDailyGoal}
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
