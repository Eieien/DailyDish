import { View, Text } from 'react-native';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}


export const SectionCard: React.FC<SectionCardProps> = ({ title, children, className }) => {
  return (
    <View className={`rounded-3xl bg-surface p-5 shadow-sm ${className ?? ''}`}>
      {title ? <Text className="mb-4 font-urbanist-bold text-lg text-ink">{title}</Text> : null}
      {children}
    </View>
  );
};
