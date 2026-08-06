import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { name: "Fresh Shopper", email: "shopper@example.com", photo: null, wallet: 320 };
const persist = (state) => savePersistedState({ user: state });

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    hydrateUser: (_, action) => action.payload || initialState,
    updateProfile: (state, action) => {
      Object.assign(state, action.payload);
      persist(state);
    }
  }
});

export const { hydrateUser, updateProfile } = userSlice.actions;
export default userSlice.reducer;
