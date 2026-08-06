import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import orderReducer from "./slices/orderSlice";
import userReducer from "./slices/userSlice";
import settingsReducer from "./slices/settingsSlice";
import { bindApiStore } from "../services/api";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    location: locationReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    user: userReducer,
    settings: settingsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

bindApiStore(store);
