import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: { bootstrapped: false, toast: null },
  reducers: {
    setBootstrapped: (state, action) => {
      state.bootstrapped = action.payload;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    }
  }
});

export const { setBootstrapped, showToast, clearToast } = appSlice.actions;
export default appSlice.reducer;
