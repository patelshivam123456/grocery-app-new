export function orderStatus(status) {
  const value = String(status || "Placed").trim().toLowerCase();
  if (value === "delivered") return { label: "Delivered", icon: "check", color: "#0D7163", background: "#E7F4ED", group: "delivered" };
  if (value === "cancelled" || value === "canceled") return { label: "Cancelled", icon: "x", color: "#A05252", background: "#FBEEEE", group: "cancelled" };
  if (/fail/.test(value)) return { label: status, icon: "alert-circle", color: "#A05252", background: "#FBEEEE", group: "failed" };
  if (value === "preparing") return { label: "Preparing your order", icon: "package", color: "#9C681F", background: "#FFF5E2", group: "ongoing" };
  return { label: status || "Placed", icon: /delivery|way/.test(value) ? "truck" : "clock", color: "#0D7163", background: "#E7F4ED", group: "ongoing" };
}

export function filterOrderHistory(orders, query = "", filter = "all") {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return orders.filter((order) => {
    if (filter !== "all" && orderStatus(order.status).group !== filter) return false;
    const searchable = [
      order.id, order.status,
      order.paymentResult?.payment?.orderNumber,
      order.paymentResult?.payment?.orderPublicId,
      order.paymentResult?.order?.orderNumber,
      order.paymentResult?.order?.orderPublicId,
      ...(order.lines || []).map((line) => line.product?.name)
    ].filter(Boolean).join(" ").toLowerCase();
    return terms.every((term) => searchable.includes(term));
  }).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

export function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  const options = { timeZone: "Asia/Kolkata" };
  return `${date.toLocaleDateString("en-IN", { ...options, day: "numeric", month: "short", year: "numeric" })} · ${date.toLocaleTimeString("en-IN", { ...options, hour: "numeric", minute: "2-digit", hour12: true })}`;
}
