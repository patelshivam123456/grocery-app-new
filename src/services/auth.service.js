import { publicClient } from "./api";
import { API_ENDPOINTS } from "./url.config";

export const STATIC_DEV_OTP = "123456";

export const authService = {
  generateOtp: (username) =>
    publicClient.post(API_ENDPOINTS.auth.generateCustomerOtp, { username }),
  verifyOtp: (username, otp = STATIC_DEV_OTP) =>
    publicClient.post(API_ENDPOINTS.auth.verifyCustomerOtp, { username, otp }, {
      headers: { "X-Request-Source": "android" }
    }),
  refreshToken: (refreshToken) =>
    publicClient.post(API_ENDPOINTS.auth.refreshToken, { refreshToken }, {
      headers: { "X-Request-Source": "android" }
    })
};
