import { apiClient } from "./api";

export const orderService = {
  create: (payload) => apiClient.post("/e-comm-admin/order/v1/create", payload)
};
