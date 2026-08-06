import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { catalogApi, normalizeCategories, normalizeProduct } from "../../services/catalogApi";

const initialState = {
  items: [],
  categories: [],
  recentlyViewed: [],
  sort: "popular",
  filter: "all",
  reviews: {},
  loading: false,
  categoriesLoading: false,
  productsLoading: false,
  error: null
};

export const fetchCatalog = createAsyncThunk("products/fetchCatalog", async () => {
  const rawCategories = await catalogApi.getCategories();
  const categories = normalizeCategories(rawCategories);
  const rawProducts = await catalogApi.getProducts();
  return {
    categories,
    products: rawProducts.map((product) => normalizeProduct(product, categories))
  };
});

export const fetchProductsForCategory = createAsyncThunk("products/fetchProductsForCategory", async (categoryPublicId, { getState }) => {
  const rawProducts = await catalogApi.getProductsByCategory(categoryPublicId);
  return rawProducts.map((product) => normalizeProduct(product, getState().products.categories));
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    viewProduct: (state, action) => {
      state.recentlyViewed = [action.payload, ...state.recentlyViewed.filter((id) => id !== action.payload)].slice(0, 8);
    },
    addProductReview: (state, action) => {
      const { productId, name, rating, text } = action.payload;
      const review = {
        id: `${productId}-${Date.now()}`,
        name: name || "Guest",
        rating,
        text,
        date: "Just now"
      };
      state.reviews[productId] = [review, ...(state.reviews[productId] || [])];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.loading = true;
        state.categoriesLoading = true;
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesLoading = false;
        state.productsLoading = false;
        state.categories = action.payload.categories;
        state.items = action.payload.products;
        state.error = null;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.categoriesLoading = false;
        state.productsLoading = false;
        state.error = action.error.message || "Unable to load catalog.";
      })
      .addCase(fetchProductsForCategory.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsForCategory.fulfilled, (state, action) => {
        state.productsLoading = false;
        const incomingIds = new Set(action.payload.map((product) => product.id));
        state.items = [...state.items.filter((product) => !incomingIds.has(product.id)), ...action.payload];
        state.error = null;
      })
      .addCase(fetchProductsForCategory.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.error.message || "Unable to load products.";
      });
  }
});

export const { setSort, setFilter, viewProduct, addProductReview } = productSlice.actions;
export default productSlice.reducer;
