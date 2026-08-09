import { publicClient } from "./api";

export const STATIC_DEV_OTP = "123456";

export const authService = {
  generateOtp: (username) =>
    publicClient.post("/authorization/auth/v1/customer-generate", { username }),
  verifyOtp: (username, otp = STATIC_DEV_OTP) =>
    publicClient.post("/authorization/auth/v1/customer-verify", { username, otp }, {
      headers: { "X-Request-Source": "android" }
    }),
  refreshToken: (refreshToken) =>
    publicClient.post("/authorization/auth/v1/refresh-token-app", { refreshToken }, {
      headers: { "X-Request-Source": "android" }
    })
};
