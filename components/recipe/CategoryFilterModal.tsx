import { Modal, View, Text, Pressable } from "react-native";

export const CATEGORY_FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

type Props = {
  visible: boolean;
  selected: CategoryFilter;
  onClose: () => void;
  onSelect: (filter: CategoryFilter) => void;
};

export function CategoryFilterModal({ visible, selected, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        <Pressable onPress={() => {}} className="w-full max-w-sm rounded-3xl bg-white p-5">
          <Text className="mb-4 text-base font-bold text-[#2B2320]">Filter by category</Text>

          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {CATEGORY_FILTERS.map((filter) => {
              const active = selected === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => {
                    onSelect(filter);
                    onClose();
                  }}
                  className={`rounded-full border px-4 py-2 ${
                    active ? "border-[#C85A3A] bg-[#C85A3A]" : "border-[#E2DDD9] bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? "text-white" : "text-[#9C9088]"}`}
                    numberOfLines={1}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5 border-t border-[#F0E4DA] pt-4">
            <Pressable
              onPress={onClose}
              className="items-center rounded-full border border-[#E2DDD9] py-3 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-[#9C9088]">Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
