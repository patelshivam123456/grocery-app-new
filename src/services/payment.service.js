import { apiClient } from "./api";

export const paymentService = {
  initiate: ({ receipt, amount, orderDto }) =>
    apiClient.post("/transaction/transaction/v1/payment-initiate", { amount, receipt, orderDto }),
  acknowledge: (payload) =>
    apiClient.post("/transaction/transaction/v1/payment-acknowledge", payload)
};
