import { View, Text } from 'react-native';

export default function Page() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-3xl font-bold mb-4">Welcome to your Home!</Text>
      <Text className="text-base text-gray-700">This is the user dashboard page.</Text>
    </View>
  );
}