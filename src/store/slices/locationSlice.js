import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = {
  addresses: [],
  selectedAddressId: null,
  permission: "unknown",
  coordinates: null
};

const persist = (state) => savePersistedState({ location: state });

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    hydrateLocation: (_, action) => action.payload || initialState,
    setPermission: (state, action) => {
      state.permission = action.payload;
      persist(state);
    },
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
      persist(state);
    },
    upsertAddress: (state, action) => {
      const address = action.payload.id ? action.payload : { ...action.payload, id: `addr-${Date.now()}` };
      const index = state.addresses.findIndex((item) => item.id === address.id);
      if (index >= 0) state.addresses[index] = address;
      else state.addresses.push(address);
      if (!state.selectedAddressId) state.selectedAddressId = address.id;
      persist(state);
    },
    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter((item) => item.id !== action.payload);
      if (state.selectedAddressId === action.payload) state.selectedAddressId = state.addresses[0]?.id || null;
      persist(state);
    },
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
      persist(state);
    }
  }
});

export const { hydrateLocation, setPermission, setCoordinates, upsertAddress, deleteAddress, selectAddress } = locationSlice.actions;
export default locationSlice.reducer;
