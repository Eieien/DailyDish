import { View, Text } from "react-native";
import RecipeCard from "./RecipeCard";

type Props = {
  title: string;
};

export default function RecipeSection({
  title,
}: Props) {
  return (
    <View className="px-5 mt-8">

      <Text className="text-lg font-bold mb-4">
        {title}
      </Text>
    <View className="flex-row flex-wrap justify-between px-1 mt-8">


      <RecipeCard title="Pinoy Breakfast" />
      <RecipeCard title="Avocado Toast" />
      <RecipeCard title="Cereal Bowl" />
      <RecipeCard title="Champorado" />


    </View>
    </View>
  );
}