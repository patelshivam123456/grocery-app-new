import { createSlice } from "@reduxjs/toolkit";
import { savePersistedState } from "../storage";

const initialState = { notifications: true, language: "English", theme: "Light" };
const persist = (state) => savePersistState({ settings: state });

function savePersistState(payload) {
  savePersistedState(payload);
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    hydrateSettings: (_, action) => action.payload || initialState,
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
      persist(state);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      persist(state);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      persist(state);
    }
  }
});

export const { hydrateSettings, toggleNotifications, setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
