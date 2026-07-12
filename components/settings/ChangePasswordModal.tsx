import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Alert } from "@/lib/alert";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async () => {
    if (!user) return;

    if (!currentPassword || !newPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await user.updatePassword({ currentPassword, newPassword });
      Alert.alert("Password updated", "Your password has been changed.");
      handleClose();
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-6"
        onPress={handleClose}>
        <Pressable className="w-full rounded-3xl bg-white p-5" onPress={() => {}}>
          <Text className="text-base font-bold text-[#2B2320] mb-4">Change Password</Text>

          <Text className="text-xs text-[#9C9088] font-medium mb-1">Current password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            className="h-11 rounded-xl border border-[#E2DDD9] bg-white px-3 text-sm text-[#2B2320] mb-3"
          />

          <Text className="text-xs text-[#9C9088] font-medium mb-1">New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            className="h-11 rounded-xl border border-[#E2DDD9] bg-white px-3 text-sm text-[#2B2320] mb-3"
          />

          <Text className="text-xs text-[#9C9088] font-medium mb-1">Confirm new password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="h-11 rounded-xl border border-[#E2DDD9] bg-white px-3 text-sm text-[#2B2320] mb-2"
          />

          {error ? <Text className="text-xs text-[#C85A3A] mb-2">{error}</Text> : null}

          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-[#9C9088]">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              disabled={saving}
              className={`flex-1 items-center rounded-full bg-[#C85A3A] py-3 ${
                saving ? "opacity-70" : "active:opacity-90"
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-semibold text-white">Update</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
