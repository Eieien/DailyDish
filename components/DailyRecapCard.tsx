import React from "react";
import { View, Text, Image } from "react-native";

const botAvatar = require("../assets/bot-avatar.png");

type Props = {
  date: string;
  message: string;
};

export default function DailyRecapCard({ date, message }: Props) {
  return (
    <View className="mx-5 mt-5 bg-[#F7D9C4] rounded-3xl p-4 flex-row items-center justify-between overflow-hidden">
      <View className="flex-1 pr-3">
        <Text className="font-bold text-[#2B2320] mb-1">Daily Recap</Text>
        <Text className="text-xs text-[#8A6A55] mb-2">{date}</Text>
        <Text className="text-sm text-[#4A3B31] leading-5">{message}</Text>
      </View>
      <View className="w-14 h-14 rounded-full  items-center justify-center overflow-hidden">
        <Image source={botAvatar} className="w-full h-full" resizeMode="cover" />
      </View>
    </View>
  );
}
