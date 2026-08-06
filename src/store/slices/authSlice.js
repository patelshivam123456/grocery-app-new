import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService, STATIC_DEV_OTP } from "../../services/auth.service";
import { savePersistedState } from "../storage";

const initialState = {
  onboardingComplete: false,
  isLoggedIn: false,
  mobile: "",
  otpVerified: false,
  accessToken: null,
  refreshToken: null,
  customer: null,
  guestMode: false,
  loading: false,
  error: null
};

function authSnapshot(state) {
  return {
    onboardingComplete: state.onboardingComplete,
    isLoggedIn: state.isLoggedIn,
    mobile: state.mobile,
    otpVerified: state.otpVerified,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    customer: state.customer,
    guestMode: state.guestMode,
    loading: false,
    error: null
  };
}

const persistAuth = (state) => savePersistedState({ auth: authSnapshot(state) });

function extractAuthPayload(response, fallbackMobile) {
  const payload = response?.data?.tokenDto || response?.data?.auth || response?.data || response;
  return {
    accessToken: payload?.accessToken || payload?.access_token || payload?.token || payload?.jwtToken || payload?.jwt || null,
    refreshToken: payload?.refreshToken || payload?.refresh_token || payload?.refresh || null,
    customer: payload?.customer || payload?.customerDto || payload?.user || (fallbackMobile ? { username: fallbackMobile } : null)
  };
}

export const generateCustomerOtp = createAsyncThunk("auth/generateCustomerOtp", async (mobile) => {
  await authService.generateOtp(mobile);
  return mobile;
});

export const verifyCustomerOtp = createAsyncThunk("auth/verifyCustomerOtp", async ({ mobile, otp = STATIC_DEV_OTP }) => {
  const response = await authService.verifyOtp(mobile, otp);
  const payload = extractAuthPayload(response, mobile);
  if (!payload.accessToken || !payload.refreshToken) {
    throw new Error("Login did not return a valid session. Please try again.");
  }
  let nextAccessToken = payload.accessToken;
  let nextRefreshToken = payload.refreshToken;
  try {
    const refreshResponse = await authService.refreshToken(payload.refreshToken);
    const refreshed = extractAuthPayload(refreshResponse);
    if (refreshed.accessToken && refreshed.refreshToken) {
      nextAccessToken = refreshed.accessToken;
      nextRefreshToken = refreshed.refreshToken;
    }
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      throw new Error(error?.response?.data?.message || "Unable to refresh session. Please login again.");
    }
  }
  const auth = {
    ...initialState,
    mobile,
    isLoggedIn: true,
    otpVerified: true,
    guestMode: false,
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
    customer: payload.customer
  };
  await savePersistedState({ auth });
  return auth;
});

export const refreshCustomerSession = createAsyncThunk("auth/refreshCustomerSession", async (storedRefreshToken, { getState, rejectWithValue }) => {
  if (!storedRefreshToken) throw new Error("Your session has expired. Please login again.");
  try {
    const response = await authService.refreshToken(storedRefreshToken);
    const payload = extractAuthPayload(response);
    if (!payload.accessToken || !payload.refreshToken) {
      return rejectWithValue({ message: "Unable to refresh session. Please login again.", status: 401 });
    }
    const currentAuth = getState().auth;
    const auth = {
      ...currentAuth,
      isLoggedIn: true,
      otpVerified: true,
      guestMode: false,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      customer: payload.customer || currentAuth.customer,
      loading: false,
      error: null
    };
    await savePersistedState({ auth });
    return auth;
  } catch (error) {
    return rejectWithValue({
      message: error?.response?.data?.message || error?.message || "Unable to refresh session.",
      status: error?.response?.status
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (_, action) => ({ ...initialState, ...(action.payload || {}) }),
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
      persistAuth(state);
    },
    requestOtp: (state, action) => {
      state.mobile = action.payload;
      state.otpVerified = false;
      persistAuth(state);
    },
    verifyOtp: (state) => {
      state.otpVerified = true;
      state.isLoggedIn = true;
      persistAuth(state);
    },
    continueAsGuest: (state) => {
      state.guestMode = true;
      state.isLoggedIn = false;
    },
    refreshTokensSucceeded: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoggedIn = true;
      persistAuth(state);
    },
    completeSignup: (state) => {
      state.isLoggedIn = true;
      persistAuth(state);
    },
    logout: () => {
      const next = { ...initialState, onboardingComplete: true };
      savePersistedState({ auth: next });
      return next;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCustomerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCustomerOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.mobile = action.payload;
        state.otpVerified = false;
        persistAuth(state);
      })
      .addCase(generateCustomerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to send OTP.";
      })
      .addCase(verifyCustomerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCustomerOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.mobile = action.payload.mobile;
        state.otpVerified = true;
        state.isLoggedIn = true;
        state.guestMode = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.customer = action.payload.customer;
        persistAuth(state);
      })
      .addCase(verifyCustomerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to verify OTP.";
      })
      .addCase(refreshCustomerSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshCustomerSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.guestMode = false;
        state.otpVerified = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        if (action.payload.customer) state.customer = action.payload.customer;
        persistAuth(state);
      })
      .addCase(refreshCustomerSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message || "Unable to refresh session.";
      });
  }
});

export const { hydrateAuth, completeOnboarding, requestOtp, verifyOtp, continueAsGuest, refreshTokensSucceeded, completeSignup, logout } = authSlice.actions;
export default authSlice.reducer;
