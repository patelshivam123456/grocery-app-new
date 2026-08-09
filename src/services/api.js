import axios from "axios";
import { loadPersistedState, savePersistedState } from "../store/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_SOURCE = "android";
const TIMEOUT = 15000;

let reduxStore;
let refreshPromise;

export function bindApiStore(store) {
  reduxStore = store;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
    "X-Request-Source": REQUEST_SOURCE
  }
});

const publicApi = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
    "X-Request-Source": REQUEST_SOURCE
  }
});

function getAuthState() {
  return reduxStore?.getState?.().auth || {};
}

async function getPersistedRefreshToken() {
  const persisted = await loadPersistedState();
  return persisted?.auth?.refreshToken;
}

function getAuthPayload(response) {
  const payload = response?.data?.data || response?.data || response;
  return payload?.tokenDto || payload?.auth || payload;
}

function getAccessToken(payload) {
  return payload?.accessToken || payload?.access_token || payload?.token || payload?.jwtToken || payload?.jwt;
}

function getRefreshToken(payload) {
  return payload?.refreshToken || payload?.refresh_token || payload?.refresh;
}

function sessionError(message) {
  const error = new Error(message);
  error.logout = true;
  return error;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getAuthState().refreshToken || await getPersistedRefreshToken();
      if (!refreshToken) throw sessionError("Your session has expired. Please login again.");

      const response = await publicApi.post("/authorization/auth/v1/refresh-token-app", { refreshToken });
      const payload = getAuthPayload(response);
      const accessToken = getAccessToken(payload);
      const nextRefreshToken = getRefreshToken(payload);
      if (!accessToken || !nextRefreshToken) throw sessionError("Unable to refresh session. Please login again.");

      const auth = { ...getAuthState(), accessToken, refreshToken: nextRefreshToken, isLoggedIn: true };
      await savePersistedState({ auth });
      reduxStore?.dispatch?.({ type: "auth/refreshTokensSucceeded", payload: { accessToken, refreshToken: nextRefreshToken } });
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAuthState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    // Development-only request trace without leaking tokens.
    console.info(`[api] ${String(config.method || "GET").toUpperCase()} ${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
        return api(original);
      } catch (refreshError) {
        const refreshStatus = refreshError?.response?.status || refreshError?.status;
        if (refreshError?.logout || refreshStatus === 401 || refreshStatus === 403) {
          reduxStore?.dispatch?.({ type: "auth/logout" });
        }
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export function normalizeApiError(error) {
  if (error?.friendlyMessage) return error;
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;
  let friendlyMessage = message || "Something went wrong. Please try again.";

  if (error?.code === "ECONNABORTED") friendlyMessage = "Request timed out. Please try again.";
  else if (!error?.response) friendlyMessage = "No internet connection. Please check your network.";
  else if (status === 403) friendlyMessage = "You do not have permission to perform this action.";
  else if (status === 404) friendlyMessage = "Requested information was not found.";
  else if (status >= 500) friendlyMessage = "Server is unavailable right now. Please try again shortly.";

  return { ...error, friendlyMessage, status };
}

export const apiClient = {
  get: (url, config) => api.get(url, config).then((response) => response.data),
  post: (url, data, config) => api.post(url, data, config).then((response) => response.data),
  put: (url, data, config) => api.put(url, data, config).then((response) => response.data),
  patch: (url, data, config) => api.patch(url, data, config).then((response) => response.data),
  delete: (url, config) => api.delete(url, config).then((response) => response.data)
};

export const publicClient = {
  get: (url, config) => publicApi.get(url, config).then((response) => response.data),
  post: (url, data, config) => publicApi.post(url, data, config).then((response) => response.data)
};
