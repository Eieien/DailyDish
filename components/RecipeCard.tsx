import { View, Text } from "react-native";

type Props = {
  title: string;
};

export default function RecipeCard({
  title,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 w-[48%]">

      <View className="h-12 rounded-md bg-gray-200 mb-3" />

      <Text className="font-bold text-base">
        {title}
      </Text>

      <Text className="text-gray-500 mt-1">
        Easy • 20 mins
      </Text>

    </View>
  );
}