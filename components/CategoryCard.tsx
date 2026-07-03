import { Pressable, Text } from "react-native";


type Props = {
  title: string;
  active: boolean;
  onPress: () => void;
};

export default function CategoryCard({
  title,
  active,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-[70px] h-[110px] rounded-full items-center justify-center ${
        active ? "bg-[#C85A3A]" : "bg-white"
      }`}
    >
      <Text
        className={`text-xs font-semibold text-center ${
          active ? "text-white" : "text-black"
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}