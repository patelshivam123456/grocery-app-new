import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "freshdash:v1";

export async function loadPersistedState() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function savePersistedState(partial) {
  const current = await loadPersistedState();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }));
}

export async function clearPersistedState() {
  await AsyncStorage.removeItem(KEY);
}
