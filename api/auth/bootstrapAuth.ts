import axios from "axios";
import { tokenStorage } from "./tokenStorage";

export async function bootstrapAuth() {
  try {
    const refreshToken = await tokenStorage.getRefresh();
    if (!refreshToken) return false;

    const res = await axios.post(
      `${process.env.EXPO_PUBLIC_PYTHON_API_URL}/auth/refresh-token`,
      { refreshToken },
      { headers: { 
        "X-Client-Type": "native",
        "X-Client-Id": process.env.EXPO_CLIENT_X_ID || ""
      }}
    );

    await tokenStorage.setAccess(res.data.accessToken);
    await tokenStorage.setRefresh(res.data.refreshToken);

    return true;
  } catch {
    await tokenStorage.clear();
    return false;
  }
}
