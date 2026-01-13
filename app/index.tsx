// app/index.tsx

import { useUser } from "@/context/UserContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, setUser, isAuthenticated } = useUser();
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/register" />;
}
