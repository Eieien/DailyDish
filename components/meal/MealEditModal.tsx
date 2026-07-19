import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { colors } from "@/constants/theme";
import { Alert } from "@/lib/alert";
import { uploadImage } from "@/app/lib/upload";
import type { MealRow } from "@/app/lib/meals";
import { updateMealLocal } from "@/app/powersync/writes";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

type Props = {
  visible: boolean;
  meal: MealRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function MealEditModalContent({ meal, onClose, onSaved }: Omit<Props, "visible">) {
  const [imageUrl, setImageUrl] = useState(meal!.imageUrl);
  const [title, setTitle] = useState(meal!.title);
  const [category, setCategory] = useState(meal!.category ?? "Breakfast");
  const calories = meal!.calories ?? meal!.nutritions?.calories ?? 0;
  const protein = meal!.nutritions?.protein ?? 0;
  const fat = meal!.nutritions?.fat ?? 0;
  const carbs = meal!.nutritions?.carbs ?? 0;
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
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
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

    if (result.canceled) return;

    setUploading(true);
    try {
      const url = await uploadImage(result.assets[0].uri, "meals");
      setImageUrl(url);
    } catch {
      Alert.alert("Failed to upload photo", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onPressImage = () => {
    Alert.alert("Meal photo", "Choose a source", [
      { text: "Take Photo", onPress: () => pickImage(true) },
      { text: "Choose from Library", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Name required", "Please enter a meal name.");
      return;
    }

    setSaving(true);
    try {
      await updateMealLocal(meal!.id, {
        title: title.trim(),
        category,
        imageUrl,
      });
      onSaved();
      onClose();
    } catch {
      Alert.alert("Failed to save meal", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="w-full max-h-[85%] rounded-3xl bg-white p-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-base font-bold text-[#2B2320] mb-4">Edit Meal</Text>

        <Pressable
          onPress={onPressImage}
          className="h-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#C85A3A]/40 bg-[#FAF7F4] mb-4"
        >
          {uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="items-center gap-1">
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text className="text-xs font-semibold text-[#C85A3A]">Add a photo</Text>
            </View>
          )}
        </Pressable>

        <Text className="text-xs text-[#9C9088] font-medium mb-1">Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="h-11 rounded-xl border border-[#E2DDD9] bg-white px-3 text-sm text-[#2B2320] mb-3"
        />

        <Text className="text-xs text-[#9C9088] font-medium mb-1">Category</Text>
        <View className="flex-row gap-2 mb-4">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 border ${
                  active ? "bg-[#C85A3A] border-[#C85A3A]" : "bg-white border-[#E2DDD9]"
                }`}
              >
                <Text className={`text-xs font-semibold ${active ? "text-white" : "text-[#9C9088]"}`}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-xs text-[#9C9088] font-medium mb-2">
          Nutrition (from the recipe)
        </Text>
        <View className="flex-row gap-2 mb-5">
          <View className="flex-1 items-center rounded-xl bg-[#FAF7F4] py-2">
            <Text className="text-[10px] text-[#9C9088] mb-1">Calories</Text>
            <Text className="text-xs font-semibold text-[#2B2320]">{calories}</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-[#FAF7F4] py-2">
            <Text className="text-[10px] text-[#9C9088] mb-1">Protein</Text>
            <Text className="text-xs font-semibold text-[#2B2320]">{protein}</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-[#FAF7F4] py-2">
            <Text className="text-[10px] text-[#9C9088] mb-1">Fat</Text>
            <Text className="text-xs font-semibold text-[#2B2320]">{fat}</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-[#FAF7F4] py-2">
            <Text className="text-[10px] text-[#9C9088] mb-1">Carbs</Text>
            <Text className="text-xs font-semibold text-[#2B2320]">{carbs}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={onClose}
            className="flex-1 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-[#9C9088]">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={saving || uploading}
            className={`flex-1 items-center rounded-full bg-[#C85A3A] py-3 ${
              saving || uploading ? "opacity-70" : "active:opacity-90"
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-semibold text-white">Save</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default function MealEditModal({ visible, meal, onClose, onSaved }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        {visible && meal ? (
          <Pressable onPress={() => {}}>
            <MealEditModalContent key={meal.id} meal={meal} onClose={onClose} onSaved={onSaved} />
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}
