import React from "react";
import { Modal, Text, Pressable, ScrollView } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export default function InfoModal({ visible, title, body, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        <Pressable className="w-full max-h-[70%] rounded-3xl bg-white p-5" onPress={() => {}}>
          <Text className="text-base font-bold text-[#2B2320] mb-3">{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-sm text-[#6B6058] leading-5">{body}</Text>
          </ScrollView>
          <Pressable
            onPress={onClose}
            className="mt-5 items-center rounded-full bg-[#C85A3A] py-3 active:opacity-90"
          >
            <Text className="text-sm font-semibold text-white">Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
