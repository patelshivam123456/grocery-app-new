import test from "node:test";
import assert from "node:assert/strict";
import { selectCartLines, selectCartTotals, selectProductReviews, selectWishlistProducts, selectUserOrders } from "../src/store/selectors.js";

const makeState = () => ({
  products: { items: [{ id: "apple", name: "Apple", price: 40, mrp: 50 }] },
  cart: { items: { apple: 2 }, units: {}, coupon: null }
});

test("wishlist results stay stable until the catalog or saved IDs change", () => {
  const state = { ...makeState(), wishlist: { ids: ["apple"] } };
  const products = selectWishlistProducts(state);
  assert.equal(products.length, 1);
  assert.strictEqual(selectWishlistProducts(state), products);
  assert.strictEqual(selectWishlistProducts({ ...state, cart: { ...state.cart, items: {} } }), products);
  const removed = { ...state, wishlist: { ids: [] } };
  assert.deepEqual(selectWishlistProducts(removed), []);
  assert.notStrictEqual(selectWishlistProducts(removed), products);
  const repriced = { ...state, products: { items: [{ ...state.products.items[0], price: 60 }] } };
  assert.equal(selectWishlistProducts(repriced)[0].price, 60);
});

test("order results stay stable and follow the current account", () => {
  const state = { orders: { items: [{ id: "one", userMobile: "self" }, { id: "two", userMobile: "other" }] }, auth: { isLoggedIn: true, mobile: "self" } };
  const orders = selectUserOrders(state);
  assert.equal(orders[0].id, "one");
  assert.equal(orders.length, 1);
  assert.strictEqual(selectUserOrders(state), orders);
  assert.strictEqual(selectUserOrders({ ...state, wishlist: { ids: [] } }), orders);
  assert.equal(selectUserOrders({ ...state, auth: { ...state.auth, mobile: "other" } })[0].id, "two");
  assert.deepEqual(selectUserOrders({ ...state, auth: { ...state.auth, isLoggedIn: false } }), []);
});

test("missing reviews return a stable empty list and new reviews remain visible", () => {
  const state = makeState();
  const empty = selectProductReviews(state, "apple");
  assert.strictEqual(selectProductReviews(state, "apple"), empty);
  assert.strictEqual(selectProductReviews({ ...state }, "apple"), empty);
  const reviews = [{ name: "Shopper", text: "Fresh", rating: 5 }];
  const updated = { ...state, products: { ...state.products, reviews: { apple: reviews } } };
  assert.strictEqual(selectProductReviews(updated, "apple"), reviews);
  assert.strictEqual(selectProductReviews(updated, "missing"), empty);
});

test("cart selectors return stable references for unchanged inputs", () => {
  const state = makeState();
  const lines = selectCartLines(state);
  const totals = selectCartTotals(state);
  const unrelatedUpdate = { ...state, user: { name: "Shopper" }, cart: { ...state.cart, paymentMethod: "UPI" } };
  assert.strictEqual(selectCartLines(state), lines);
  assert.strictEqual(selectCartTotals(state), totals);
  assert.strictEqual(selectCartLines(unrelatedUpdate), lines);
  assert.strictEqual(selectCartTotals(unrelatedUpdate), totals);
  assert.deepEqual(totals, { subtotal: 80, delivery: 25, platform: 7, discount: 0, total: 112, count: 2 });
});

test("cart quantity and product price changes recompute totals", () => {
  const state = makeState();
  const initial = selectCartTotals(state);
  const largerCart = { ...state, cart: { ...state.cart, items: { apple: 3 } } };
  assert.notStrictEqual(selectCartTotals(largerCart), initial);
  assert.equal(selectCartTotals(largerCart).subtotal, 120);
  assert.equal(selectCartTotals(largerCart).delivery, 0);
  const updatedPrice = { ...state, products: { items: [{ ...state.products.items[0], price: 60 }] } };
  assert.equal(selectCartTotals(updatedPrice).subtotal, 120);
});

test("variant prices and eligible coupons retain the existing calculations", () => {
  const state = makeState();
  state.cart = {
    items: { "apple::2 kg": 2 },
    units: { "apple::2 kg": { label: "2 kg", price: 150, mrp: 180 } },
    coupon: { id: "SAVE50", min: 299, discount: 50 }
  };
  const lines = selectCartLines(state);
  assert.equal(lines[0].product.quantity, "2 kg");
  assert.equal(lines[0].lineTotal, 300);
  assert.deepEqual(selectCartTotals(state), { subtotal: 300, delivery: 0, platform: 7, discount: 50, total: 257, count: 2 });
  const ineligible = { ...state, cart: { ...state.cart, coupon: { min: 500, discount: 100 } } };
  assert.strictEqual(selectCartLines(ineligible), lines);
  assert.equal(selectCartTotals(ineligible).discount, 0);
});

test("empty carts and unavailable catalog products are handled consistently", () => {
  const state = { products: { items: [] }, cart: { items: { missing: 2 }, units: {}, coupon: null } };
  assert.deepEqual(selectCartLines(state), []);
  assert.deepEqual(selectCartTotals(state), { subtotal: 0, delivery: 0, platform: 0, discount: 0, total: 0, count: 0 });
  const empty = {};
  assert.strictEqual(selectCartLines(empty), selectCartLines({}));
  assert.strictEqual(selectCartTotals(empty), selectCartTotals({}));
});
