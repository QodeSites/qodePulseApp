
import { useColorScheme } from "@hooks/use-color-scheme";
import { ToastProvider } from "@hooks/use-toast";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { UserProvider } from "@/context/UserContext";

if (Platform.OS === "web") {
  require("nativewind");
}

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    "Lato-Bold": require("@/assets/fonts/Lato-Bold.ttf"),
    "Lato-Light": require("@/assets/fonts/Lato-Light.ttf"),
    Lato: require("@/assets/fonts/Lato-Regular.ttf"),
    "PlayfairDisplay-Bold": require("@/assets/fonts/PlayfairDisplay-Bold.ttf"),
    "PlayfairDisplay-Medium": require("@/assets/fonts/PlayfairDisplay-Medium.ttf"),
    "PlayfairDisplay-SemiBold": require("@/assets/fonts/PlayfairDisplay-SemiBold.ttf"),
    PlayfairDisplay: require("@/assets/fonts/PlayfairDisplay-Regular.ttf"),
    // Add any other font files present in your assets/fonts/ folder here
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ToastProvider>
          <RootLayoutInner />
        </ToastProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
