import { publicClient } from "./api";
import { API_ENDPOINTS } from "./url.config";

export const productService = {
  getCategories: () => publicClient.get(API_ENDPOINTS.catalog.categories),
  getProducts: () => publicClient.get(API_ENDPOINTS.catalog.products),
  getProductsByCategory: (categoryPublicId) =>
    publicClient.get(API_ENDPOINTS.catalog.productsByCategory(categoryPublicId))
};
