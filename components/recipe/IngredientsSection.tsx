import { View, Text } from 'react-native';

import { SectionCard } from '@/components/ui/SectionCard';

interface IngredientsSectionProps {
  ingredients: string[];
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients }) => {
  return (
    <SectionCard title="Ingredients">
      <View className="flex-row flex-wrap">
        {ingredients.map((item, index) => (
          <View key={`${item}-${index}`} className="mb-3 w-1/2 flex-row items-center pr-2">
            <View className="mr-2 h-2.5 w-2.5 rounded-full border-2 border-primary" />
            <Text className="flex-1 font-urbanist-medium text-sm text-ink">{item}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};
