import React from "react";
import { View, Text } from "react-native";

type Props = {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
};

export default function MacroBar({ label, current, goal, unit = "g", color }: Props) {
  const pct = Math.min(100, Math.round((current / goal) * 100));

  return (
    <View className="flex-1">
      <Text className="text-xs text-[#9C9088] mb-1">{label}</Text>
      <View className="h-2 rounded-full bg-[#F0E4DA] overflow-hidden mb-1">
        <View
          style={{ width: `${pct}%`, backgroundColor: color }}
          className="h-2 rounded-full"
        />
      </View>
      <Text className="text-xs text-[#2B2320]">
        {current}/{goal}
        {unit}
      </Text>
    </View>
  );
}
