import { View, Text, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import Constants from 'expo-constants';

interface ExpoExtra {
  environment?: string;
  apiUrl?: string;
}

export default function Home() {
  const extra = Constants.expoConfig?.extra as ExpoExtra | undefined;

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="p-6 bg-blue-500 rounded-lg shadow-lg mb-6">
        <Text className="text-white text-2xl font-bold mb-2">
          React Native + Expo Router
        </Text>
        <Text className="text-white text-sm mb-1">
          Environment:
        </Text>
        <Text className="text-white text-sm mb-1">
          API URL: 
        </Text>
        <Text className="text-white text-sm">
          App Version: {Constants.expoConfig?.version}
        </Text>
      </View>

      <View className="w-full space-y-4">
       
        <TouchableOpacity 
          className="bg-purple-500 p-4 rounded-lg"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-center font-semibold">
            Login Page
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-600 text-base mt-8">
        TypeScript + Expo Router + NativeWind 🚀
      </Text>
    </View>
  );
}