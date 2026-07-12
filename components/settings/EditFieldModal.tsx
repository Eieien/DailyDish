import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  keyboardType?: "default" | "number-pad";
  saving?: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
};

function EditFieldModalContent({
  title,
  label,
  initialValue,
  keyboardType = "default",
  saving = false,
  onClose,
  onSave,
}: Omit<Props, "visible">) {
  const [value, setValue] = useState(initialValue);

  return (
    <View className="w-full rounded-3xl bg-white p-5">
      <Text className="text-base font-bold text-[#2B2320] mb-4">{title}</Text>

      <Text className="text-xs text-[#9C9088] font-medium mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        autoFocus
        className="h-11 rounded-xl border border-[#E2DDD9] bg-white px-3 text-sm text-[#2B2320] mb-5"
      />

      <View className="flex-row gap-3">
        <Pressable
          onPress={onClose}
          className="flex-1 items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-[#9C9088]">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => onSave(value)}
          disabled={saving}
          className={`flex-1 items-center rounded-full bg-[#C85A3A] py-3 ${
            saving ? "opacity-70" : "active:opacity-90"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-sm font-semibold text-white">Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function EditFieldModal({ visible, onClose, ...rest }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        {visible ? (
          <Pressable onPress={() => {}}>
            <EditFieldModalContent key={rest.initialValue} onClose={onClose} {...rest} />
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}
