import React, { useState } from "react";
import { 
  View,
  ScrollView,
  StatusBar,
  Pressable,
  Text,
  Alert,
  Image,
  StyleSheet,
  TextInput
 } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { Ionicons, Feather as Icons  } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from 'react-native-dropdown-picker';
import { styleText } from "node:util";

// import {uploadImage} from './util/storage';


export default function HomeScreen() {
  const router = useRouter();
  const {userId} = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "grid" | "profile">(
    "home"
  );

  const [recipe, setRecipe] = useState("");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [items, setItems] = React.useState([
    {label: 'Breakfast', value: 'Breakfast'},
    {label: 'Lunch', value: 'Lunch'},
    {label: 'Dinner', value: 'Dinner'},
    {label: 'Snacks', value: 'Snacks'}
  ]);
  const [ingredients, setIngredients] = useState(["", "", ""]);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  // Remove ingredient at index
  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  // Update ingredient text
  const updateIngredient = (text: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = text;
    setIngredients(updated);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };


  const pickRecipeImage = async () => {
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) return;
    const image = result.assets[0];
    // await updateBanner(image.uri);
  };


 


  return (
    <SafeAreaView className="flex-1 bg-[#FDF3EC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="flex-1">
            <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
              <Pressable
                onPress={goBack}
                hitSlop={12}
                className="h-9 w-9 items-center justify-center rounded-full bg-surface shadow-sm active:opacity-70">
                <Ionicons name="chevron-back" size={20} color={colors.ink} />
              </Pressable>
              <Text className="font-urbanist-bold text-lg text-ink">Add Recipe</Text>
            </View>
            
            {/* UPload img */}
            <View style={styles.uploadImg}>
                <Pressable
                  accessibilityRole="button"
                  onPress={pickRecipeImage}
                >
                  <Image
                  source={
                  require("../assets/images/upload.png")
                  }
                />
                </Pressable>
              </View>
            
            {/* upper input */}
            <View style={styles.body}>
              <View style={styles.inputField}>
                <Text style={styles.inputTitle}>Recipe Name</Text>
                <TextInput
                  placeholder="..."
                  placeholderTextColor="#9E9E9E"
                  onChangeText={setRecipe}
                  value={recipe}
                  style={styles.input}
                />
              </View>
              <View style={styles.inputField}>
                <Text style={styles.inputTitle}>Category</Text>
                <DropDownPicker
                  placeholder="Select a Category"
                  placeholderStyle={{color: "#9E9E9E"}}
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
              </View>
            </View>

            {/* ingredients */}
            <View style={styles.ingredients}>
              <Text style={[styles.inputTitle, {marginBottom: 10}]}>Ingredients</Text>
              {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.inputRow}>
                    <TextInput
                      style={styles.inputRows}
                      value={ingredient}
                      onChangeText={(text) => updateIngredient(text, index)}
                    />
                    <Pressable onPress={() => removeIngredient(index)}>
                      <Ionicons name="close" size={20} color="red" />
                    </Pressable>
                  </View>
                ))}

                <Pressable style={styles.addButton} onPress={addIngredient}>
                  <Text style={styles.addText}>+ Add Ingredient</Text>
                </Pressable>
            </View>

            {/* nutrition */}
            <View style={styles.inputField}>
                <View style={styles.nutritionTop}>
                  <Text style={[styles.inputTitle, {marginRight: 120, padding: 7}]}> Nutrition</Text>
                  <Pressable style={styles.estimate}>
                    <Image
                      style={{
                        height: 20,
                        width: 30,
                        resizeMode: "contain" ,
                        tintColor: "white",
                        padding: 0,
                        margin: 0,
                      }}
                      source={require("../assets/images/chatbot.png")}
                    />
                    <Text style={styles.estimateBtn}>AI Estimate</Text>
                  </Pressable>
                </View>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionBox}>
                      <Text style={styles.valuesTitle}>Calories</Text>
                      <Text style={styles.values}>280 kcal</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                      <Text style={styles.valuesTitle}>Protien</Text>
                      <Text style={styles.values}>28 g</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                      <Text style={styles.valuesTitle}>Carbs</Text>
                      <Text style={styles.values}>28 g</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                      <Text style={styles.valuesTitle}>Fat</Text>
                      <Text style={styles.values}>28 g</Text>
                  </View>
                </View>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  uploadImg:{
    alignSelf: "center",
    marginTop: 10
  },
  body:{
    marginTop: 15,
  },
  inputField:{
    marginHorizontal: 30,
    marginTop: 10,
  },
  inputTitle:{
    fontWeight: "bold",
  },
  inputBox:{
    alignSelf: "center",
  },
  input: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DDD9",
    borderRadius: 7,
    paddingHorizontal: 12,
    color: "#333",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 5,
  },
  dropdown: {
    height: 30,
    width: 333,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DDD9",
    borderRadius: 7,
    paddingHorizontal: 12,
    color: "#333",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 5,
  },
  dropdownContainer: {
    height: "auto",
    width: 333,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DDD9",
    borderRadius: 7,
    paddingHorizontal: 12,
    color: "#333",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 5,
  },
  ingredients:{
    marginHorizontal: 30,
    marginTop: 30,
  },
   inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputRows: {
    height: 40,
    width: 295,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DDD9",
    borderRadius: 7,
    paddingHorizontal: 12,
    color: "#333",
    fontSize: 15,
    marginRight: 10,
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#C85A3A",
    borderRadius: 25,
    padding: 8,
    alignItems: "center",
    width: 170,
  },
  addText: {
    color: "#C85A3A",
    fontWeight: "600",
  },
  nutritionTop:{
    marginTop: 10,
    flexDirection: "row",
  },
  estimate:{
    backgroundColor: "#C85A3A",
    flexDirection: "row",
    padding: 5,
    borderRadius: 20,
  },
  estimateBtn: {
    color: "white", 
    padding: 2, 
    paddingRight: 8,
    fontSize: 13,
  },
  nutritionRow:{
    flexDirection: "row",
    gap: 10,
  },
  nutritionBox:{
    borderWidth: 1,
    borderColor: "#9E9E9E",
    borderRadius: 15,
    padding: 12,
    width: 75,
    marginTop: 15,
  },
  valuesTitle:{
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold"
  },
  values:{
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold"
  }
})