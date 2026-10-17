import test from "node:test";
import assert from "node:assert/strict";
import { filterOrderHistory, formatOrderDate, orderStatus } from "../src/services/orderHistory.js";

const orders = [
  { id: "FD1", status: "Delivered", createdAt: "2026-10-15T10:26:00Z", lines: [{ product: { name: "Fortune Basmati Rice" } }] },
  { id: "FD2", status: "Preparing", createdAt: "2026-10-17T11:22:00Z", lines: [{ product: { name: "Wheat Atta" } }] },
  { id: "FD3", status: "Cancelled", createdAt: "2026-10-16T10:26:00Z", lines: [{ product: { name: "Milk" } }], paymentResult: { payment: { orderNumber: "ORDER-321" } } },
  { id: "FD4", status: "Payment failed", createdAt: "2026-10-14T10:26:00Z" }
];

test("history is newest first without changing the saved order list", () => {
  assert.deepEqual(filterOrderHistory(orders).map((order) => order.id), ["FD2", "FD3", "FD1", "FD4"]);
  assert.deepEqual(orders.map((order) => order.id), ["FD1", "FD2", "FD3", "FD4"]);
});

test("search finds product names and local and payment order IDs", () => {
  assert.deepEqual(filterOrderHistory(orders, " BASMATI fortune ").map((order) => order.id), ["FD1"]);
  assert.deepEqual(filterOrderHistory(orders, "fd2").map((order) => order.id), ["FD2"]);
  assert.deepEqual(filterOrderHistory(orders, "order-321").map((order) => order.id), ["FD3"]);
  assert.deepEqual(filterOrderHistory(orders, "missing"), []);
});

test("status filters work together with search and exclude failed orders from ongoing", () => {
  assert.deepEqual(filterOrderHistory(orders, "", "ongoing").map((order) => order.id), ["FD2"]);
  assert.deepEqual(filterOrderHistory(orders, "rice", "delivered").map((order) => order.id), ["FD1"]);
  assert.deepEqual(filterOrderHistory(orders, "atta", "delivered"), []);
  assert.deepEqual(filterOrderHistory(orders, "", "cancelled").map((order) => order.id), ["FD3"]);
  assert.equal(orderStatus("Preparing").label, "Preparing your order");
  assert.equal(orderStatus("Delivered").icon, "check");
  assert.equal(orderStatus("Cancelled").icon, "x");
  assert.equal(orderStatus("Out for delivery").icon, "truck");
});

test("order dates use India time and missing dates have a fallback", () => {
  const formatted = formatOrderDate("2026-10-17T11:22:00Z");
  assert.match(formatted, /17 Oct 2026/);
  assert.match(formatted, /4:52/);
  assert.equal(formatOrderDate("invalid"), "Date unavailable");
});
