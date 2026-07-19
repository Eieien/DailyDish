import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/constants/theme';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';

interface RecipeHeroProps {
  image: string | null;
  onEdit?: () => void;
}

export const RecipeHero: React.FC<RecipeHeroProps> = ({ image, onEdit }) => {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="h-72 w-full overflow-hidden rounded-b-[32px]">
      <ImageOrPlaceholder uri={image} className="h-full w-full" iconSize={40} />

      <Pressable
        onPress={goBack}
        hitSlop={12}
        className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm active:opacity-70">
        <Ionicons name="chevron-back" size={20} color={colors.ink} />
      </Pressable>

      {onEdit ? (
        <Pressable
          onPress={onEdit}
          hitSlop={12}
          className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm active:opacity-70">
          <Ionicons name="pencil" size={17} color={colors.ink} />
        </Pressable>
      ) : null}
    </View>
  );
};
