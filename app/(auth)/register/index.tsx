import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setShouldAnimateExitingForTag } from 'react-native-reanimated/lib/typescript/core';
import { useUser } from '@/context/UserContext';
import { oauthlogin } from '@/api/auth/auth.service';

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser, isAuthenticated } = useUser();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    });
  }, []);

  const startSignInFlow = async () => {
    setError('');
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo)

      // Make sure userInfo structure is correct before proceeding
      if (userInfo && userInfo.data.user && userInfo.data.user.id && userInfo.data.user.email) {
        try {
          const userFromApi = await oauthlogin({
            provider: "google",
            provider_user_id: userInfo.data.user.id,
            email: userInfo.data.user.email,
            username: userInfo.data.user.name ?? userInfo.data.user.email.split("@")[0],
            full_name: userInfo.data.user.name ?? "",
            oauth_payload: userInfo
          });
          console.log(userFromApi)

          setUser(userFromApi);
          router.replace('/(tabs)');
        } catch (e) {
          setError('Failed to log in with Google.');
        }
      } else {
        setError('No user information returned.');
      }

    } catch (err) {
      console.log(err,"====================err")
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        onPress={startSignInFlow}
        disabled={isLoading}
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderWidth: 1,
          borderColor: '#ddd',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
          opacity: isLoading ? 0.5 : 1,
        }}
        activeOpacity={0.8}
      >
        {/* You can import and use a Google logo SVG or PNG here if you have one */}
        <Text style={{ fontWeight: 'bold', color: '#37584f', marginRight: 8 }}>
          {/* You may use a Google icon here */}
          G
        </Text>
        <Text style={{ color: '#37584f', fontSize: 16 }}>Sign in with Google</Text>
        {isLoading && <ActivityIndicator size="small" color="#02422b" style={{ marginLeft: 10 }} />}
      </TouchableOpacity>

      <Text className="text-center text-[11px] text-[#789] mt-8">
        © 2025 Qode Advisors LLP | SEBI Registered PMS No: INP000008914 | All Rights Reserved
      </Text>
    </View>
  );
}