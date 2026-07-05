import { View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/constants/theme';

interface RecipeHeroProps {
  image: string;
}

export const RecipeHero: React.FC<RecipeHeroProps> = ({ image }) => {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="h-72 w-full overflow-hidden rounded-b-[32px]">
      <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />

      <Pressable
        onPress={goBack}
        hitSlop={12}
        className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm active:opacity-70">
        <Ionicons name="chevron-back" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
};
