import { publicClient } from "./api";

export const productService = {
  getCategories: () => publicClient.get("/admin/category/v1/get-all"),
  getProducts: () => publicClient.get("/admin/product/v1/get-all?filter=all"),
  getProductsByCategory: (categoryPublicId) =>
    publicClient.get(`/admin/product/v1/get-all?filter=all&categoryPublicId=${encodeURIComponent(categoryPublicId)}`)
};
