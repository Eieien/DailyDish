import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  value?: string;
  danger?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

export default function SettingsRow({
  label,
  value,
  danger,
  showChevron = true,
  isLast,
  onPress,
  switchValue,
  onSwitchChange,
}: Props) {
  const hasSwitch = typeof switchValue === "boolean" && onSwitchChange;

  return (
    <Pressable
      onPress={hasSwitch ? undefined : onPress}
      className={`flex-row items-center justify-between px-4 py-4 ${
        isLast ? "" : "border-b border-[#F0E4DA]"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          danger ? "text-[#D2601A]" : "text-[#2B2320]"
        }`}
      >
        {label}
      </Text>
      <View className="flex-row items-center">
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E3D6CA", true: "#D2601A" }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <>
            {value ? (
              <Text className="text-xs text-[#9C9088] mr-2">{value}</Text>
            ) : null}
            {showChevron && (
              <Ionicons name="chevron-forward" size={16} color="#C9BCB1" />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}
