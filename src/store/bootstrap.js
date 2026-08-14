import { createAsyncThunk } from "@reduxjs/toolkit";
import { loadPersistedState } from "./storage";
import { setBootstrapped } from "./slices/appSlice";
import { hydrateAuth, logout, refreshCustomerSession } from "./slices/authSlice";
import { hydrateLocation } from "./slices/locationSlice";
import { hydrateCart } from "./slices/cartSlice";
import { hydrateWishlist } from "./slices/wishlistSlice";
import { hydrateOrders } from "./slices/orderSlice";
import { hydrateUser } from "./slices/userSlice";
import { hydrateSettings } from "./slices/settingsSlice";
import { fetchCatalog } from "./slices/productSlice";

let startupHydrationPromise = null;

async function runStartupHydration(dispatch) {
  const state = await loadPersistedState();
  dispatch(hydrateAuth(state.auth));
  dispatch(hydrateLocation(state.location));
  dispatch(hydrateCart(state.cart));
  dispatch(hydrateWishlist(state.wishlist));
  dispatch(hydrateOrders(state.orders));
  dispatch(hydrateUser(state.user));
  dispatch(hydrateSettings(state.settings));

  const storedRefreshToken = state.auth?.refreshToken;
  if (!storedRefreshToken) {
    dispatch(logout());
    await dispatch(fetchCatalog());
    dispatch(setBootstrapped(true));
    return;
  }

  try {
    await dispatch(refreshCustomerSession(storedRefreshToken)).unwrap();
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      dispatch(logout());
      await dispatch(fetchCatalog());
      dispatch(setBootstrapped(true));
      return;
    }
    await dispatch(fetchCatalog());
    dispatch(setBootstrapped(true));
    return;
  }

  await dispatch(fetchCatalog());
  dispatch(setBootstrapped(true));
}

export const hydrateApp = createAsyncThunk("app/hydrate", async (_, { dispatch }) => {
  if (!startupHydrationPromise) {
    startupHydrationPromise = runStartupHydration(dispatch).finally(() => {
      startupHydrationPromise = null;
    });
  }
  return startupHydrationPromise;
});
