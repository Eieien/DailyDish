import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  uri?: string | null;
  className?: string;
  style?: StyleProp<ImageStyle | ViewStyle>;
  iconSize?: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Renders the photo when one exists, otherwise a neutral icon placeholder
 * instead of a stock stand-in photo. */
export function ImageOrPlaceholder({
  uri,
  className,
  style,
  iconSize = 20,
  icon = "restaurant-outline",
}: Props) {
  if (uri) {
    return <Image source={{ uri }} className={className} style={style as StyleProp<ImageStyle>} />;
  }

  return (
    <View
      className={`items-center justify-center bg-[#FAF7F4] ${className ?? ""}`}
      style={style as StyleProp<ViewStyle>}
    >
      <Ionicons name={icon} size={iconSize} color="#C9BCB1" />
    </View>
  );
}
