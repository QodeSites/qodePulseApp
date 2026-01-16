import { tokenStorage } from "@/api/auth/tokenStorage";
import { emitUnauthorized } from "@hooks/authEvents";
import axios from "axios";
import { bootstrapAuth } from "./auth/bootstrapAuth";
// Utility to make sure headers object exists and is not undefined/null
function ensureHeaders(config: any) {
  if (!config.headers) config.headers = {};
  return config.headers;
}

// Axios instances (fixed for correct env var names, fallback, and consistent export)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
const PY_BASE_URL = process.env.EXPO_PUBLIC_PYTHON_API_URL || process.env.PYTHON_PUBLIC_API_URL || "";
const DATA_BASE_URL = process.env.EXPO_PUBLIC_DATA_API_URL || process.env.EXPO_PUBLIC_DATA_API_URL || "";

const X_CLIENT_ID =
  process.env.EXPO_PUBLIC_X_CLIENT_ID ||
  process.env.EXPO_CLIENT_X_ID ||
  process.env.X_CLIENT_ID ||
  "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "X-Client-Type": "native",
    "X-Client-Id": X_CLIENT_ID,
  },
});

const pyapi = axios.create({
  baseURL: PY_BASE_URL,
  headers: {
    "X-Client-Type": "native",
    "X-Client-Id": X_CLIENT_ID,
  },
});

const dataapi = axios.create({
  baseURL: DATA_BASE_URL,
});

export { api, dataapi, pyapi };

let refreshing = false as boolean;
let queue: Array<{resolve: (token: string) => void, reject: (err: any) => void}> = [];

// --- Token Injection --- //
async function injectToken(config: any) {
  try {
    const token = await tokenStorage.getAccess();
    if (token) {
      ensureHeaders(config).Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Optionally log or handle token retrieval error
  }
  return config;
}

api.interceptors.request.use(injectToken);
pyapi.interceptors.request.use(injectToken);

// Improved handleAuthError function to ensure that 401 causes global logout if refresh fails (or no refresh token)
async function handleAuthError(error: any, originApi: typeof api | typeof pyapi) {
  try {
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    // Only handle 401 here
    if (error.response?.status === 401) {
      const refreshToken = await tokenStorage.getRefresh();
    
      if (!refreshToken) {
        await tokenStorage.clear();
        emitUnauthorized();
        return Promise.reject(error);
      }
      if (refreshing) {
        // Wait for refresh to complete and retry
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((accessToken) => {
          if (!accessToken) {
            emitUnauthorized();
            return Promise.reject(error);
          }
          // Retry with new token
          ensureHeaders(original).Authorization = `Bearer ${accessToken}`;
          return originApi(original);
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        // Try to refresh tokens
        const refreshed = await bootstrapAuth();
        if (!refreshed) {
          queue.forEach(item => item.reject(error));
          queue = [];
          await tokenStorage.clear();
          emitUnauthorized();
          return Promise.reject(error);
        }
        let accessToken = await tokenStorage.getAccess();
        if (!accessToken) {
          queue.forEach(item => item.reject(error));
          queue = [];
          await tokenStorage.clear();
          emitUnauthorized();
          return Promise.reject(error);
        }

        // Release queue after refresh
        queue.forEach(item => item.resolve(accessToken));
        queue = [];

        // Retry original request
        ensureHeaders(original).Authorization = `Bearer ${accessToken}`;
        return originApi(original);
      } catch (refreshError) {
        queue.forEach(item => item.reject(refreshError));
        queue = [];
        await tokenStorage.clear();
        emitUnauthorized();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    // Not a 401 error or already retried
    return Promise.reject(error);

  } catch (catchError) {
    // Extreme: if there's any failure here, assume unrecoverable authentication failure and log out
    await tokenStorage.clear();
    emitUnauthorized();
    return Promise.reject(catchError);
  }
}

// Intercept and log all responses for api
api.interceptors.response.use(
  response => {
    // Optionally remove logs in production
    // console.log("API RESPONSE:", response);
    return response;
  },
  error => {
    // Optionally remove error logs in production
    // console.error("API ERROR:", error);
    return handleAuthError(error, api);
  }
);

// Intercept and log all responses for pyapi
pyapi.interceptors.response.use(
  response => {
    // Optionally remove logs in production
    // console.log("PYAPI RESPONSE:", response);
    return response;
  },
  error => {
    // Optionally remove error logs in production
    // console.error("PYAPI ERROR:", error);
    return handleAuthError(error, pyapi);
  }
);

dataapi.interceptors.response.use(
  response => {
    // Optionally remove logs in production
    // console.log("PYAPI RESPONSE:", response);
    return response;
  },
  error => {
    // Optionally remove error logs in production
    // console.error("PYAPI ERROR:", error);
    return handleAuthError(error, pyapi);
  }
);
