import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import MacroBar from "./MacroBar";
import { DailyProgress } from "../data/types";
import { colors } from "../constants/theme";

type Props = {
  progress: DailyProgress;
};

const SIZE = 110;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CaloriesSummary({ progress }: Props) {
  const remaining = progress.goalCalories - progress.foodCalories;
  const pct = Math.min(1, progress.foodCalories / progress.goalCalories);
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <View className="mx-5 mt-5 bg-white rounded-3xl p-5">
      <Text className="font-bold text-[#2B2320] mb-4">Calories</Text>

      <View className="flex-row items-center justify-between mb-5">
        <View style={{ width: SIZE, height: SIZE }}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={colors.border}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={colors.primary}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              rotation="-90"
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          </Svg>
          <View
            style={{ position: "absolute", width: SIZE, height: SIZE }}
            className="items-center justify-center"
          >
            <Text className="text-2xl font-bold text-[#2B2320]">
              {progress.foodCalories}
            </Text>
            <Text className="text-xs text-[#9C9088]">
              kcal{"\n"}of {progress.goalCalories}
            </Text>
          </View>
        </View>

        <View className="ml-4">
          <View className="mb-3">
            <Text className="text-xs text-[#9C9088]">Goal</Text>
            <Text className="text-sm font-semibold text-[#2B2320]">
              {progress.goalCalories} kcal
            </Text>
          </View>
          <View className="mb-3">
            <Text className="text-xs text-[#9C9088]">Food</Text>
            <Text className="text-sm font-semibold text-[#2B2320]">
              {progress.foodCalories} kcal
            </Text>
          </View>
          <View>
            <Text className="text-xs text-[#9C9088]">Remaining</Text>
            <Text className="text-sm font-semibold text-[#2B2320]">
              {remaining} kcal
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row" style={{ gap: 16 }}>
        <MacroBar
          label="Protein"
          current={progress.protein.current}
          goal={progress.protein.goal}
          color={colors.proteinBar}
        />
        <MacroBar
          label="Fat"
          current={progress.fat.current}
          goal={progress.fat.goal}
          color={colors.fatBar}
        />
        <MacroBar
          label="Carbs"
          current={progress.carbs.current}
          goal={progress.carbs.goal}
          color={colors.carbBar}
        />
      </View>
    </View>
  );
}
