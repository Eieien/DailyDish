import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Pressable,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";

import { SectionCard } from "@/components/ui/SectionCard";
import { useRecipeById } from "./hooks/useRecipes";
import { insertRecipeLocal, updateRecipeLocal } from "./powersync/writes";
import { uploadImage } from "./lib/upload";
import { estimateNutrition } from "./lib/estimateNutrition";
import { Alert } from "@/lib/alert";

const CATEGORY_ITEMS = [
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
  { label: "Snacks", value: "Snacks" },
];

export default function AddRecipeScreen() {
  const router = useRouter();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!editId;
  const { userId } = useAuth({ treatPendingAsSignedOut: false });
  const { recipe: existingRecipe, isLoading: loadingExisting } = useRecipeById(editId);
  const [seededFromId, setSeededFromId] = useState<string | null>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recipe, setRecipe] = useState("");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(null);
  const [items, setItems] = React.useState(CATEGORY_ITEMS);
  const [ingredients, setIngredients] = useState(["", "", ""]);
  const [steps, setSteps] = useState(["", ""]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed the form once from the watched recipe (only the first time it
  // becomes available for this editId) so further local edits aren't
  // clobbered by refetches as the underlying row changes.
  useEffect(() => {
    if (!editId || loadingExisting || seededFromId === editId) return;

    if (!existingRecipe) {
      Alert.alert("Recipe not found", "This recipe may have been deleted.");
      setSeededFromId(editId);
      return;
    }

    setImageUri(existingRecipe.image);
    setRecipe(existingRecipe.title);
    setValue(existingRecipe.category);
    setIngredients(existingRecipe.ingredients?.length ? existingRecipe.ingredients : ["", "", ""]);
    setSteps(existingRecipe.steps?.length ? existingRecipe.steps : ["", ""]);
    setCalories(String(existingRecipe.calories ?? existingRecipe.nutritions?.calories ?? ""));
    setProtein(String(existingRecipe.nutritions?.protein ?? ""));
    setFat(String(existingRecipe.nutritions?.fat ?? ""));
    setCarbs(String(existingRecipe.nutritions?.carbs ?? ""));
    setSeededFromId(editId);
  }, [editId, existingRecipe, loadingExisting, seededFromId]);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (text: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = text;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (text: string, index: number) => {
    const updated = [...steps];
    updated[index] = text;
    setSteps(updated);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const pickFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the camera is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
  };

  const onPickImage = () => {
    Alert.alert("Add a photo", "Choose a source", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onAiEstimate = async () => {
    if (!recipe.trim()) {
      Alert.alert("Recipe name required", "Enter a recipe name first so AI has something to estimate from.");
      return;
    }

    setEstimating(true);
    try {
      const cleanedIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
      const result = await estimateNutrition(recipe.trim(), cleanedIngredients);
      setCalories(String(result.calories));
      setProtein(String(result.protein));
      setFat(String(result.fat));
      setCarbs(String(result.carbs));
    } catch {
      Alert.alert("Estimate failed", "Couldn't get an AI estimate. Please enter values manually.");
    } finally {
      setEstimating(false);
    }
  };

  const onSaveRecipe = async () => {
    if (!userId) return;

    if (!recipe.trim()) {
      Alert.alert("Recipe name required", "Please enter a name for your recipe.");
      return;
    }

    const cleanedIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
    const cleanedSteps = steps.map((s) => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      let uploadedImageUrl: string | null = imageUri;
      if (imageUri && !imageUri.startsWith("http")) {
        uploadedImageUrl = await uploadImage(imageUri, "recipes");
      }

      const nutrition = {
        calories: parseInt(calories, 10) || 0,
        protein: parseInt(protein, 10) || 0,
        fat: parseInt(fat, 10) || 0,
        carbs: parseInt(carbs, 10) || 0,
      };

      if (isEditing && editId) {
        await updateRecipeLocal(editId, {
          title: recipe.trim(),
          category: value,
          image: uploadedImageUrl,
          calories: nutrition.calories,
          ingredients: cleanedIngredients,
          nutritions: nutrition,
          steps: cleanedSteps,
        });
      } else {
        await insertRecipeLocal({
          userId,
          title: recipe.trim(),
          category: value,
          image: uploadedImageUrl,
          calories: nutrition.calories,
          ingredients: cleanedIngredients,
          nutritions: nutrition,
          steps: cleanedSteps,
        });
      }
      router.replace(isEditing ? `/recipe/${editId}` : "/(tabs)/recipe");
    } catch {
      Alert.alert(
        isEditing ? "Failed to save changes" : "Failed to save recipe",
        "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
          <Pressable
            onPress={goBack}
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface shadow-sm active:opacity-70">
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
          <Text className="font-urbanist-bold text-lg text-ink">
            {isEditing ? "Edit Recipe" : "Add Recipe"}
          </Text>
        </View>

        <View className="gap-5 px-5 pt-2">
          <Pressable
            onPress={onPickImage}
            className="h-44 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-primary/40 bg-surface">
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
                <View className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full bg-ink/70 px-3 py-1.5">
                  <Ionicons name="camera-outline" size={14} color={colors.surface} />
                  <Text className="font-urbanist-semibold text-xs text-white">Change photo</Text>
                </View>
              </>
            ) : (
              <View className="items-center gap-2">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral">
                  <Ionicons name="camera-outline" size={22} color={colors.primary} />
                </View>
                <Text className="font-urbanist-semibold text-sm text-primary">Add a photo</Text>
                <Text className="font-urbanist text-xs text-muted">Camera or photo library</Text>
              </View>
            )}
          </Pressable>

          <SectionCard title="Recipe Info" className="z-30">
            <View className="gap-4">
              <View>
                <Text className="mb-2 font-urbanist-semibold text-sm text-ink">Recipe Name</Text>
                <TextInput
                  placeholder="e.g. Pinoy Breakfast"
                  placeholderTextColor={colors.muted}
                  onChangeText={setRecipe}
                  value={recipe}
                  className="rounded-2xl border border-line bg-surface px-4 py-3 font-urbanist text-sm text-ink"
                />
              </View>

              <View>
                <Text className="mb-2 font-urbanist-semibold text-sm text-ink">Category</Text>
                <DropDownPicker
                  placeholder="Select a category"
                  placeholderStyle={{ color: colors.muted, fontFamily: "Urbanist_400Regular" }}
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  zIndex={3000}
                  zIndexInverse={1000}
                  style={{
                    borderColor: colors.border,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    minHeight: 46,
                  }}
                  textStyle={{ fontFamily: "Urbanist_400Regular", fontSize: 14, color: colors.ink }}
                  dropDownContainerStyle={{
                    borderColor: colors.border,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                  }}
                />
              </View>
            </View>
          </SectionCard>

          <SectionCard title="Ingredients" className="z-10">
            <View className="gap-3">
              {ingredients.map((ingredient, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <TextInput
                    placeholder={`Ingredient ${index + 1}`}
                    placeholderTextColor={colors.muted}
                    value={ingredient}
                    onChangeText={(text) => updateIngredient(text, index)}
                    className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3 font-urbanist text-sm text-ink"
                  />
                  <Pressable
                    onPress={() => removeIngredient(index)}
                    hitSlop={8}
                    className="h-9 w-9 items-center justify-center rounded-full bg-neutral active:opacity-70">
                    <Ionicons name="close" size={16} color={colors.secondary} />
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={addIngredient}
                className="items-center self-start rounded-full border border-primary px-4 py-2 active:opacity-70">
                <Text className="font-urbanist-semibold text-sm text-primary">
                  + Add Ingredient
                </Text>
              </Pressable>
            </View>
          </SectionCard>

          <SectionCard title="Steps" className="z-10">
            <View className="gap-3">
              {steps.map((step, index) => (
                <View key={index} className="flex-row items-start gap-2">
                  <Text className="mt-3 w-5 text-center font-urbanist-bold text-sm text-primary">
                    {index + 1}.
                  </Text>
                  <TextInput
                    placeholder={`Step ${index + 1}`}
                    placeholderTextColor={colors.muted}
                    value={step}
                    onChangeText={(text) => updateStep(text, index)}
                    multiline
                    className="flex-1 rounded-2xl border border-line bg-surface px-4 py-3 font-urbanist text-sm text-ink"
                  />
                  <Pressable
                    onPress={() => removeStep(index)}
                    hitSlop={8}
                    className="mt-1 h-9 w-9 items-center justify-center rounded-full bg-neutral active:opacity-70">
                    <Ionicons name="close" size={16} color={colors.secondary} />
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={addStep}
                className="items-center self-start rounded-full border border-primary px-4 py-2 active:opacity-70">
                <Text className="font-urbanist-semibold text-sm text-primary">+ Add Step</Text>
              </Pressable>
            </View>
          </SectionCard>

          <SectionCard className="z-10">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-urbanist-bold text-lg text-ink">Nutrition</Text>
              <Pressable
                onPress={onAiEstimate}
                disabled={estimating}
                className={`flex-row items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 ${
                  estimating ? "opacity-70" : "active:opacity-90"
                }`}>
                {estimating ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Ionicons name="sparkles-outline" size={14} color={colors.surface} />
                )}
                <Text className="font-urbanist-semibold text-xs text-white">
                  {estimating ? "Estimating…" : "AI Estimate"}
                </Text>
              </Pressable>
            </View>
            <Text className="mb-3 font-urbanist text-xs text-muted">
              Enter values manually, or tap AI Estimate to have Gemini fill them in for you.
            </Text>

            <View className="flex-row gap-3">
              <NutritionInput label="Calories" unit="kcal" value={calories} onChangeText={setCalories} />
              <NutritionInput label="Protein" unit="g" value={protein} onChangeText={setProtein} />
              <NutritionInput label="Carbs" unit="g" value={carbs} onChangeText={setCarbs} />
              <NutritionInput label="Fat" unit="g" value={fat} onChangeText={setFat} />
            </View>
          </SectionCard>

          <Pressable
            onPress={onSaveRecipe}
            disabled={saving}
            className={`items-center justify-center rounded-full bg-primary py-4 shadow-sm ${
              saving ? "opacity-70" : "active:opacity-90"
            }`}>
            {saving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text className="font-urbanist-bold text-base text-white">
                {isEditing ? "Save Changes" : "Save Recipe"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionInput({
  label,
  unit,
  value,
  onChangeText,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-neutral py-2">
      <Text className="mb-1 font-urbanist text-[10px] text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.muted}
        className="w-full text-center font-urbanist-bold text-sm text-ink"
      />
      <Text className="font-urbanist text-[10px] text-muted">{unit}</Text>
    </View>
  );
}
