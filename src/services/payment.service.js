import { apiClient } from "./api";

export const paymentService = {
  initiate: ({ orderPublicId, receipt, amount }) =>
    apiClient.post("/api/proxy/transaction/payment-initiate", { orderPublicId, receipt, amount }),
  acknowledge: (payload) =>
    apiClient.post("/api/proxy/transaction/payment-acknowledge", payload)
};
