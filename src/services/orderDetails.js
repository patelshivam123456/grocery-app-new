import { orderStatus } from "./orderHistory.js";

export function orderProgress(status) {
  const group = orderStatus(status).group;
  if (group === "cancelled" || group === "failed") {
    return { labels: ["Placed", group === "cancelled" ? "Cancelled" : "Failed"], current: 1, terminal: true };
  }
  const value = String(status || "").trim().toLowerCase();
  const current = group === "delivered" ? 3 : /out for delivery|on the way/.test(value) ? 2 : value === "preparing" ? 1 : 0;
  return { labels: ["Placed", "Preparing", "On the way", "Delivered"], current, terminal: false };
}

export function orderBill(order) {
  const lines = order.lines || [];
  const hasSubtotal = lines.length > 0 && lines.every((line) => line.lineTotal != null && Number.isFinite(Number(line.lineTotal)));
  const subtotal = hasSubtotal ? Number(lines.reduce((sum, line) => sum + Number(line.lineTotal), 0).toFixed(2)) : null;
  const total = Number(order.total) || 0;
  // Older orders do not save separate delivery charges and coupon amounts.
  // Show their combined adjustment instead of inventing a fee breakdown.
  const adjustment = subtotal == null ? null : Number((total - subtotal).toFixed(2));
  return { subtotal, adjustment, total };
}

export function canCancelOrder(status) {
  return ["placed", "preparing"].includes(String(status || "").trim().toLowerCase());
}
