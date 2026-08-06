import { publicClient } from "./api";

export const productService = {
  getCategories: () => publicClient.get("/e-comm-admin/category/v1/get-all"),
  getProducts: () => publicClient.get("/e-comm-admin/product/v1/get-all?filter=all"),
  getProductsByCategory: (categoryPublicId) =>
    publicClient.get(`/e-comm-admin/product/v1/get-all?filter=all&categoryPublicId=${encodeURIComponent(categoryPublicId)}`)
};
