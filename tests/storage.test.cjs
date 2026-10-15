const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");

function loadModule(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { code } = babel.transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: ["@babel/plugin-transform-modules-commonjs"]
  });
  const context = { exports: {}, require: (name) => dependencies[name] || require(name) };
  vm.runInNewContext(code, context, { filename: file });
  return context.exports;
}

function setup() {
  let value = null;
  const storage = loadModule("src/store/storage.js", {
    "@react-native-async-storage/async-storage": {
      async getItem() { return value; },
      async setItem(key, next) { value = next; },
      async removeItem() { value = null; }
    }
  });
  const cart = loadModule("src/store/slices/cartSlice.js", { "../storage": storage });
  return { storage, cart, read: () => value === null ? null : JSON.parse(value) };
}

test("adding a cart variant persists after Redux revokes its draft", async () => {
  const { storage, cart, read } = setup();
  const unit = { label: "1 kg", price: 40, imageGallery: ["https://example.com/apple"] };
  const state = cart.default(undefined, cart.addToCart({ productId: "apple", unit }));
  // Wait until the reducer's queued write has completed.
  await storage.savePersistedState({});
  assert.equal(state.items["apple::1 kg"], 1);
  assert.equal(read().cart.items["apple::1 kg"], 1);
  assert.deepEqual(read().cart.units["apple::1 kg"], unit);
});

test("rapid cart updates persist the most recent quantity", async () => {
  const { storage, cart, read } = setup();
  let state = cart.default(undefined, cart.addToCart("apple"));
  state = cart.default(state, cart.addToCart("apple"));
  state = cart.default(state, cart.decrementCart("apple"));
  await storage.savePersistedState({});
  assert.equal(state.items.apple, 1);
  assert.equal(read().cart.items.apple, 1);
});

test("simultaneous saves preserve both slices and snapshot their input", async () => {
  const { storage, read } = setup();
  const cart = { items: { apple: 1 } };
  const first = storage.savePersistedState({ cart });
  cart.items.apple = 99;
  const second = storage.savePersistedState({ wishlist: { ids: ["apple"] } });
  await Promise.all([first, second]);
  assert.equal(read().cart.items.apple, 1);
  assert.deepEqual(read().wishlist.ids, ["apple"]);
});

test("clearing storage runs after pending saves", async () => {
  const { storage, read } = setup();
  const saving = storage.savePersistedState({ cart: { items: { apple: 1 } } });
  const clearing = storage.clearPersistedState();
  await Promise.all([saving, clearing]);
  assert.equal(read(), null);
});
