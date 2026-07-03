import { View, Text } from "react-native";
import { useState } from "react";
import CategoryCard from "./CategoryCard";

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
];

export default function CategoryList() {
  const [selected, setSelected] = useState("Breakfast");

  return (
    <View className="px-5 mt-6">
      <Text className="text-lg font-bold">
        Categories
      </Text>

      <View className="flex-row justify-between mt-4">
        {categories.map((category) => (
          <CategoryCard
            key={category}
            title={category}
            active={selected === category}
            onPress={() => setSelected(category)}
          />
        ))}
      </View>
    </View>
  );
}