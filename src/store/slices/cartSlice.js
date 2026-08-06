import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { items: {}, units: {}, coupon: null, deliveryInstruction: "", paymentMethod: "UPI" };
const persist = (state) => savePersistedState({ cart: state });

const cartKey = (payload) => {
  if (typeof payload === "string") return payload;
  if (!payload?.unit) return payload?.productId;
  return `${payload.productId}::${payload.unit.label}`;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (_, action) => ({ ...initialState, ...(action.payload || {}) }),
    addToCart: (state, action) => {
      const key = cartKey(action.payload);
      if (!key) return;
      state.items[key] = (state.items[key] || 0) + 1;
      if (typeof action.payload === "object" && action.payload.unit) {
        state.units[key] = action.payload.unit;
      }
      persist(state);
    },
    decrementCart: (state, action) => {
      const key = cartKey(action.payload);
      if (!state.items[key]) return;
      state.items[key] -= 1;
      if (state.items[key] <= 0) {
        delete state.items[key];
        delete state.units[key];
      }
      persist(state);
    },
    removeFromCart: (state, action) => {
      const key = cartKey(action.payload);
      delete state.items[key];
      delete state.units[key];
      persist(state);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      persist(state);
    },
    setDeliveryInstruction: (state, action) => {
      state.deliveryInstruction = action.payload;
      persist(state);
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      persist(state);
    },
    clearCart: () => {
      persist(initialState);
      return initialState;
    }
  }
});

export const { hydrateCart, addToCart, decrementCart, removeFromCart, applyCoupon, setDeliveryInstruction, setPaymentMethod, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
