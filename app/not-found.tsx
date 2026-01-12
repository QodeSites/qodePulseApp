import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 bg-gray-100 items-center justify-center p-6">
      <View className="bg-white p-8 rounded-lg shadow-lg items-center">
        <Text className="text-6xl mb-4">404</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          The page you're looking for doesn't exist.
        </Text>
        
        <Link href="/" asChild>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">
              Go to Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}