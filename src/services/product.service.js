import { publicClient } from "./api";

export const productService = {
  getCategories: () => publicClient.get("/admin/category/v1/get-all"),
  getProducts: () => publicClient.get("/admin/product/v1/get-all?filter=active"),
  getProductsByCategory: (categoryPublicId) =>
    publicClient.get(`/admin/product/v1/get-all?filter=active&categoryPublicId=${encodeURIComponent(categoryPublicId)}`)
};
