// app/index.tsx

import { tokenStorage } from "@/api/auth/tokenStorage";
import { pyapi } from "@/api/axios";
import { useUser } from "@/context/UserContext";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const accessToken = await tokenStorage.getAccess();

        if (!accessToken) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
            setUserReady(true); // set as ready, though unauthenticated
          }
          return;
        }

        const res = await pyapi.get("/auth/me");

        if (isMounted) {
          // Some APIs (like your /auth/me) may send user data as res.data.data, instead of res.data.data.user:
          // Adjust below line as per actual payload:
          setUser(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // setUser is async; wait for React state to catch up before marking ready
          setTimeout(() => setUserReady(true), 0);
        }
      }
    })();

    return () => { isMounted = false; };
  }, [setUser]);

  if (loading || !userReady) {
    // Wait for both loading to finish AND state update to propagate
    return null;
  }


  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/register" />;
}
