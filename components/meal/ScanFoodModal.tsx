import { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { colors } from "@/constants/theme";
import { Alert } from "@/lib/alert";
import { uploadImage } from "@/app/_lib/upload";
import { estimateNutritionFromImage, type FoodScanEstimate } from "@/app/_lib/estimateNutrition";
import { localIsoDate } from "@/app/_lib/meals";
import type { MealSlot } from "@/data/types";
import { insertMealLocal, insertRecipeLocal } from "@/app/_powersync/writes";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";

const CATEGORIES: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

function guessCategoryByTime(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 21) return "Dinner";
  return "Snacks";
}

type Props = {
  visible: boolean;
  userId: string | null | undefined;
  onClose: () => void;
  onAdded: () => void;
};

type Stage = "capture" | "estimating" | "confirm" | "saving";

function ScanFoodModalContent({ userId, onClose, onAdded }: Omit<Props, "visible">) {
  const [stage, setStage] = useState<Stage>("capture");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState<MealSlot>(guessCategoryByTime());
  const [nutrition, setNutrition] = useState<FoodScanEstimate | null>(null);

  const pickAndEstimate = async (fromCamera: boolean) => {
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
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          base64: true,
          quality: 0.6,
        });

    if (result.canceled || !result.assets[0]?.base64) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setStage("estimating");

    try {
      const estimate = await estimateNutritionFromImage(asset.base64!, asset.mimeType ?? "image/jpeg");
      if (!estimate.recognized) {
        Alert.alert(
          "Couldn't identify food",
          "That doesn't look like a recognizable food photo. Please try again with a clearer picture."
        );
        setStage("capture");
        return;
      }
      setFoodName(estimate.foodName);
      setNutrition(estimate);
      setStage("confirm");
    } catch {
      Alert.alert("Couldn't identify food", "Please try again with a clearer photo.");
      setStage("capture");
    }
  };

  const onPressCapture = () => {
    Alert.alert("Scan your food", "Choose a source", [
      { text: "Take Photo", onPress: () => pickAndEstimate(true) },
      { text: "Choose from Library", onPress: () => pickAndEstimate(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onConfirm = async () => {
    if (!userId || !nutrition) return;
    setStage("saving");

    try {
      const photoUrl = imageUri ? await uploadImage(imageUri, "meals").catch(() => null) : null;
      const title = foodName.trim() || "Scanned meal";
      const nutritions = {
        calories: nutrition.calories,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
      };

      // Every meal is backed by a recipe — scanning food with no existing
      // recipe selected auto-creates one (so it's also reusable later from
      // My Recipes), then logs the meal against it.
      const recipeId = await insertRecipeLocal({
        userId,
        title,
        category,
        image: photoUrl,
        calories: nutrition.calories,
        nutritions,
      });

      await insertMealLocal({
        userId,
        recipeId,
        title,
        category,
        calories: nutrition.calories,
        imageUrl: photoUrl,
        completed: true,
        mealDate: localIsoDate(),
        nutritions,
      });
      onAdded();
      onClose();
    } catch {
      Alert.alert("Couldn't log meal", "Please try again.");
      setStage("confirm");
    }
  };

  return (
    <View className="w-full max-h-[85%] rounded-3xl bg-white p-5">
      <Text className="text-base font-bold text-[#2B2320] mb-4">Scan Food</Text>

      {stage === "capture" ? (
        <Pressable
          onPress={onPressCapture}
          className="h-40 items-center justify-center rounded-2xl border border-dashed border-[#C85A3A]/40 bg-[#FAF7F4]"
        >
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <Text className="mt-2 text-sm font-semibold text-[#C85A3A]">Take or choose a photo</Text>
          <Text className="mt-1 text-xs text-[#9C9088] text-center px-6">
            We'll identify the food and estimate its nutrition for you.
          </Text>
        </Pressable>
      ) : null}

      {stage === "estimating" ? (
        <View className="h-40 items-center justify-center rounded-2xl bg-[#FAF7F4]">
          {imageUri ? (
            <ImageOrPlaceholder uri={imageUri} className="absolute h-full w-full rounded-2xl opacity-40" />
          ) : null}
          <ActivityIndicator color={colors.primary} />
          <Text className="mt-2 text-xs font-semibold text-[#9C9088]">Identifying food…</Text>
        </View>
      ) : null}

      {(stage === "confirm" || stage === "saving") && nutrition ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageOrPlaceholder uri={imageUri} className="h-40 w-full rounded-2xl mb-4" />

          <Text className="text-xs text-[#9C9088] font-medium mb-1">Food</Text>
          <View className="h-11 justify-center rounded-xl border border-[#E2DDD9] bg-white px-3 mb-3">
            <Text className="text-sm text-[#2B2320]">{foodName || "Scanned meal"}</Text>
          </View>

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

          <Text className="text-xs text-[#9C9088] font-medium mb-2">Estimated nutrition</Text>
          <View className="flex-row gap-2 mb-5">
            {(
              [
                ["Calories", `${nutrition.calories}`, "kcal"],
                ["Protein", `${nutrition.protein}`, "g"],
                ["Fat", `${nutrition.fat}`, "g"],
                ["Carbs", `${nutrition.carbs}`, "g"],
              ] as const
            ).map(([label, value, unit]) => (
              <View key={label} className="flex-1 items-center rounded-2xl bg-[#FAF7F4] py-2">
                <Text className="mb-1 text-[10px] text-[#9C9088]">{label}</Text>
                <Text className="text-sm font-bold text-[#2B2320]">{value}</Text>
                <Text className="text-[10px] text-[#9C9088]">{unit}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                setStage("capture");
                setImageUri(null);
                setNutrition(null);
              }}
              disabled={stage === "saving"}
              className="flex-1 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-[#9C9088]">Retake</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={stage === "saving"}
              className={`flex-1 items-center rounded-full bg-[#C85A3A] py-3 ${
                stage === "saving" ? "opacity-70" : "active:opacity-90"
              }`}
            >
              {stage === "saving" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-semibold text-white">Log Meal</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {stage === "capture" ? (
        <Pressable
          onPress={onClose}
          className="mt-4 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-[#9C9088]">Close</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ScanFoodModal({ visible, userId, onClose, onAdded }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        {visible ? (
          <Pressable onPress={() => {}}>
            <ScanFoodModalContent userId={userId} onClose={onClose} onAdded={onAdded} />
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}
