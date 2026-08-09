import { apiClient } from "./api";

export const paymentService = {
  initiate: ({ orderPublicId, receipt, amount }) =>
    apiClient.post("/transaction/v1/payment-initiate", { orderPublicId, receipt, amount }),
  acknowledge: (payload) =>
    apiClient.post("/transaction/v1/payment-acknowledge", payload)
};
