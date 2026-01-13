import { api, pyapi } from "@/api/axios";
import { tokenStorage } from "./tokenStorage";

export async function login(email: string, password: string) {
  const res = await pyapi.post("/login", { email, password });

  await tokenStorage.setAccess(res.data.accessToken);
  await tokenStorage.setRefresh(res.data.refreshToken);

  return res.data.user;
}

export async function logout() {
  const refreshToken = await tokenStorage.getRefresh();
  if (refreshToken) {
    await pyapi.post("/logout", { refreshToken });
  }
  await tokenStorage.clear();
}


export async function oauthlogin({
  provider,
  provider_user_id,
  email,
  username,
  full_name = null,
  oauth_payload = null,
}: {
  provider: string;
  provider_user_id: string;
  email: string;
  username: string;
  full_name?: string | null;
  oauth_payload?: Record<string, any> | null;
}) {
  try {
    const res = await pyapi.post("/auth/oauth-login", {
      provider,
      provider_user_id,
      email,
      username,
      full_name,
      oauth_payload,
    });
    console.log(res,"===================repsone")

    await tokenStorage.setAccess(res.data.accessToken);
    await tokenStorage.setRefresh(res.data.refreshToken);

    return res.data.user;
  } catch (error) {
    console.error("OAuth login failed:", error);
    // Optionally, extract error message coming from server
    if (error?.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
}

