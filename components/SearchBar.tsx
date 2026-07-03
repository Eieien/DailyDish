import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar() {
  return (
    <View className="flex-row items-center px-6.5">
      {/* Search Bar */}
      <View className="flex-1 flex-row items-center bg-white rounded-2xl h-14 pt-4">
        <Ionicons name="search" size={20} color="#9CA3AF" />

        <TextInput
          placeholder="Search recipes..."
          className="flex-1 ml-3"
        />
      </View>

      {/* Filter Button */}
      <Pressable className="ml-3 w-14 h-14 rounded-md bg-[#C85A3A] items-center justify-center">
        <Ionicons name="options-outline" size={22} color="white" />
      </Pressable>
    </View>
  );
}