import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "freshdash:v1";
let pendingWrite = Promise.resolve();

function enqueueWrite(operation) {
  const write = pendingWrite.then(operation);
  pendingWrite = write.catch(() => {});
  return write;
}

export async function loadPersistedState() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function savePersistedState(partial) {
  // Reducers can pass Immer drafts, which are revoked as soon as the reducer returns.
  const snapshot = JSON.stringify(partial);
  return enqueueWrite(async () => {
    const current = await loadPersistedState();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...JSON.parse(snapshot) }));
  });
}

export async function clearPersistedState() {
  return enqueueWrite(() => AsyncStorage.removeItem(KEY));
}
