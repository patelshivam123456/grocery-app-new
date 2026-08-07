import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { name: "Fresh Shopper", email: "shopper@example.com", photo: null, wallet: 320, birthday: "" };
const persist = (state) => savePersistedState({ user: state });

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    hydrateUser: (_, action) => action.payload || initialState,
    updateProfile: (state, action) => {
      Object.assign(state, action.payload);
      persist(state);
    },
    addWalletMoney: (state, action) => {
      const amount = Number(action.payload) || 0;
      if (amount <= 0) return;
      state.wallet = (Number(state.wallet) || 0) + amount;
      persist(state);
    }
  }
});

export const { hydrateUser, updateProfile, addWalletMoney } = userSlice.actions;
export default userSlice.reducer;
