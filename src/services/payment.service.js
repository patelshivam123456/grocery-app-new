import { apiClient } from "./api";
import { API_ENDPOINTS } from "./url.config";

export const paymentService = {
  initiate: (payload) =>
    apiClient.post(API_ENDPOINTS.order.checkout, payload),
  acknowledge: (payload) =>
    apiClient.post(API_ENDPOINTS.payment.acknowledge, payload)
};
