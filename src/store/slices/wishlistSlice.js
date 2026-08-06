import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { ids: [] };
const persist = (state) => savePersistedState({ wishlist: state });

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist: (_, action) => action.payload || initialState,
    toggleWishlist: (state, action) => {
      const id = action.payload;
      state.ids = state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [id, ...state.ids];
      persist(state);
    },
    removeWishlist: (state, action) => {
      state.ids = state.ids.filter((item) => item !== action.payload);
      persist(state);
    }
  }
});

export const { hydrateWishlist, toggleWishlist, removeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
