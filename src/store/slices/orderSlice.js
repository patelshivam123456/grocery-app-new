import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { items: [] };
const persist = (state) => savePersistedState({ orders: state });

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    hydrateOrders: (_, action) => action.payload || initialState,
    placeOrder: (state, action) => {
      const order = {
        id: `FD${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "Preparing",
        ...action.payload
      };
      state.items.unshift(order);
      persist(state);
    },
    cancelOrder: (state, action) => {
      const order = state.items.find((item) => item.id === action.payload);
      if (order) order.status = "Cancelled";
      persist(state);
    },
    markOrderDelivered: (state, action) => {
      const order = state.items.find((item) => item.id === action.payload);
      if (order && order.status !== "Cancelled" && order.status !== "Delivered") {
        order.status = "Delivered";
        order.deliveredAt = new Date().toISOString();
      }
      persist(state);
    }
  }
});

export const { hydrateOrders, placeOrder, cancelOrder, markOrderDelivered } = orderSlice.actions;
export default orderSlice.reducer;
