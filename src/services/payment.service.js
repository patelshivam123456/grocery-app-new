import { apiClient } from "./api";

export const paymentService = {
  initiate: ({ orderPublicId, receipt, amount, orderNumber }) =>
    apiClient.post("/transaction/transaction/v1/payment-initiate", { orderPublicId, receipt, amount, orderNumber }),
  acknowledge: (payload) =>
    apiClient.post("/transaction/transaction/v1/payment-acknowledge", payload)
};
