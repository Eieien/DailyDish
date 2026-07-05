import { View, Text } from 'react-native';

import { SectionCard } from '@/components/ui/SectionCard';

interface StepsSectionProps {
  steps: string[];
}

export const StepsSection: React.FC<StepsSectionProps> = ({ steps }) => {
  return (
    <SectionCard title="Steps">
      {steps.map((step, index) => (
        <View key={index} className={`flex-row ${index === steps.length - 1 ? '' : 'mb-3'}`}>
          <Text className="mr-3 w-5 font-urbanist-bold text-sm text-primary">{index + 1}.</Text>
          <Text className="flex-1 font-urbanist text-sm leading-5 text-ink">{step}</Text>
        </View>
      ))}
    </SectionCard>
  );
};
