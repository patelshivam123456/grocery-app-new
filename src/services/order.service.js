import { apiClient } from "./api";
import { API_ENDPOINTS } from "./url.config";

export const orderService = {
  create: (payload) => apiClient.post(API_ENDPOINTS.order.create, payload)
};
