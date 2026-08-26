export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

export const API_ENDPOINTS = {
  auth: {
    generateCustomerOtp: "/authorization/auth/v1/customer-generate",
    verifyCustomerOtp: "/authorization/auth/v1/customer-verify",
    refreshToken: "/authorization/auth/v1/refresh-token-app"
  },
  catalog: {
    categories: "/admin/category/v1/get-all",
    products: "/admin/product/v1/get-all?filter=active",
    productsByCategory: (categoryPublicId) =>
      `/admin/product/v1/get-all?filter=active&categoryPublicId=${encodeURIComponent(categoryPublicId)}`
  },
  order: {
    create: "/e-comm-admin/order/v1/create",
    checkout: "/orders/order/v1/checkout"
  },
  payment: {
    acknowledge: "/transaction/transaction/v1/payment-acknowledge"
  }
};
