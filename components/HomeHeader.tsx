import { View, Text, Image } from "react-native";
import SearchBar from "./SearchBar";

export default function HomeHeader() {
  return (
    <View className="bg-white rounded-b-3xl px-5 pt-7 pb-6">
      <View className="flex-row items-center justify-between">

        <View className="flex-row items-center">
          <Image
            source={require("@/assets/images/profile.png")}
            className="w-12 h-12 rounded-full"
          />

          <View className="ml-4">
            <Text className="text-lg font-bold">
              Hello, Tom!
            </Text>

            <Text className="text-xs text-gray-500">
              Check recipes to add to your plan...
            </Text>
          </View>
        </View>

      </View>
      <SearchBar />
    </View>
  );
}