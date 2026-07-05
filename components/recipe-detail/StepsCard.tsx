import React from "react";
import { View, Text } from "react-native";

type Props = {
  steps: string[];
};

export default function StepsCard({ steps }: Props) {
  return (
    <View className="mx-5 mt-4 bg-white rounded-3xl p-5">
      <Text className="font-bold text-[#2B2320] mb-3">Steps</Text>
      {steps.map((step, index) => (
        <View key={index} className="flex-row mb-3">
          <Text className="text-[#D2601A] font-bold w-6">{index + 1}.</Text>
          <Text className="flex-1 text-sm text-[#4A3B31] leading-5">
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}
