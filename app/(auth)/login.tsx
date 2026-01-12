import React, { useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const redirectUri = makeRedirectUri({ scheme: 'qodetech' });
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '831494674798-gic4jkpub5pti1vqcn27g736o5q718b9.apps.googleusercontent.com',
    androidClientId: '831494674798-3eevk8jo5nahhbgava9sdhg09l36m51f.apps.googleusercontent.com',
    webClientId: '831494674798-psq4l4gaam20dsks68slrr7mmu35dmdo.apps.googleusercontent.com',
    selectAccount: true,
    redirectUri
  },discovery);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log(authentication)
      router.replace('/(user)/home');
    } else if (response?.type === 'error') {
      setError('Authentication failed. Please try again.');
    }
  }, [response]);

  return (
    <View className="flex-1 bg-background items-center justify-center px-4">
      <View className="flex flex-row items-end mb-8">
        <Text className="font-serif text-2xl font-[600] text-primary" style={{ lineHeight: 44 }}>
          my
        </Text>
        <Text className="font-serif text-6xl font-[600] text-primary" style={{ lineHeight: 64 }}>
          Qode
        </Text>
      </View>

      {error ? (
        <Text className="text-red-600 bg-[#ffeaea] border border-[#EF4444] px-3 py-2 mb-2 rounded text-sm text-center">
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        className={`flex-row items-center justify-center bg-white border border-[#ccc] rounded py-3 px-5 mb-2 shadow-md ${isLoading ? 'opacity-50' : ''}`}
        onPress={() => {
          setError('');
          setIsLoading(true);
          promptAsync()
            .finally(() => setIsLoading(false));
        }}
        disabled={!request || isLoading}
        activeOpacity={0.8}
      >
        <View style={{
          width: 22, height: 22, backgroundColor: 'transparent', marginRight: 8,
          justifyContent: 'center', alignItems: 'center'
        }}>
          {/* Simple Google 'G' SVG, or replace with Image if you have an asset */}
          <Text style={{ fontSize: 24 }}>🌐</Text>
        </View>
        <Text style={{ color: "#222", fontWeight: '600', fontSize: 16 }}>Sign in with Google</Text>
        {isLoading ? <ActivityIndicator color="#888" style={{ marginLeft: 8 }} /> : null}
      </TouchableOpacity>

      <Text className="text-center text-[11px] text-[#789] mt-8">
        © 2025 Qode Advisors LLP | SEBI Registered PMS No: INP000008914 | All Rights Reserved
      </Text>
    </View>
  );
}
