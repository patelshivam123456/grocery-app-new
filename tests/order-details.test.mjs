import test from "node:test";
import assert from "node:assert/strict";
import { canCancelOrder, orderBill, orderProgress } from "../src/services/orderDetails.js";

test("progress highlights the actual stage rather than completing the whole timeline", () => {
  assert.equal(orderProgress("Placed").current, 0);
  assert.equal(orderProgress("Preparing").current, 1);
  assert.equal(orderProgress("Out for delivery").current, 2);
  assert.equal(orderProgress("Delivered").current, 3);
  assert.equal(orderProgress("Delivered").terminal, false);
});

test("cancelled and failed orders have terminal timelines without a delivered stage", () => {
  assert.deepEqual(orderProgress("Cancelled"), { labels: ["Placed", "Cancelled"], current: 1, terminal: true });
  assert.deepEqual(orderProgress("Payment failed").labels, ["Placed", "Failed"]);
});

test("historical bills reconcile with the saved total and do not guess separate fees", () => {
  assert.deepEqual(orderBill({ lines: [{ lineTotal: 40 }, { lineTotal: 40 }], total: 112 }), { subtotal: 80, adjustment: 32, total: 112 });
  assert.deepEqual(orderBill({ lines: [{ lineTotal: "200" }, { lineTotal: 100 }], total: 257 }), { subtotal: 300, adjustment: -43, total: 257 });
  assert.deepEqual(orderBill({ lines: [{ lineTotal: 0.1 }, { lineTotal: 0.2 }], total: 0.3 }), { subtotal: 0.3, adjustment: 0, total: 0.3 });
});

test("missing historical line totals do not produce a fabricated subtotal", () => {
  assert.deepEqual(orderBill({ total: 72 }), { subtotal: null, adjustment: null, total: 72 });
  assert.equal(orderBill({ lines: [{ product: { price: 1000 } }], total: 72 }).subtotal, null);
});

test("only placed and preparing orders offer cancellation", () => {
  assert.equal(canCancelOrder("Placed"), true);
  assert.equal(canCancelOrder("Preparing"), true);
  for (const status of ["Out for delivery", "Delivered", "Cancelled", "Payment failed", undefined]) assert.equal(canCancelOrder(status), false);
});
