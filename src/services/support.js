export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@justharvst.com";
const configuredPhone = (process.env.EXPO_PUBLIC_SUPPORT_PHONE || "").trim();
export const SUPPORT_PHONE = /^\+?[\d ()-]{7,}$/.test(configuredPhone) && configuredPhone.replace(/\D/g, "").length >= 7 ? configuredPhone : "";

export const SUPPORT_TOPICS = [
  { id: "orders", title: "Orders & delivery", subtitle: "Tracking, cancellations", icon: "truck" },
  { id: "items", title: "Items & quality", subtitle: "Missing or damaged items", icon: "shopping-bag" },
  { id: "payments", title: "Payments & wallet", subtitle: "Charges, payment queries", icon: "credit-card" },
  { id: "account", title: "My account", subtitle: "Profile, saved addresses", icon: "user" }
];

export const SUPPORT_FAQS = [
  { id: "track", topic: "orders", question: "Where can I track my order?", answer: "Open Orders, select your ongoing order and tap Track order to view its latest status." },
  { id: "cancel", topic: "orders", question: "How do I cancel an order?", answer: "Open the order details and choose Cancel order if the option is available. You can cancel while the order is placed or being prepared." },
  { id: "missing", topic: "items", question: "An item is missing or incorrect. What should I do?", answer: "Contact support from the relevant order and tell us which item is missing or different from what you ordered. Your order reference will be included in the email." },
  { id: "quality", topic: "items", question: "How do I report a damaged or poor-quality item?", answer: "Choose the order you need help with and describe the affected item. You can attach photos in your email app before sending the message." },
  { id: "payment", topic: "payments", question: "My payment was deducted, but I cannot see an order.", answer: "Check your order history first. If the order is not listed, email support with the payment date, amount and transaction reference so the payment can be reviewed." },
  { id: "wallet", topic: "payments", question: "Where can I check my wallet payment?", answer: "The bill summary in your order details shows the payment method and any wallet contribution. You can view your wallet balance under Fresh Money on your profile." },
  { id: "address", topic: "account", question: "How do I manage my delivery addresses?", answer: "Open Profile, then Address book to add or update a saved address. Changes to saved addresses do not change the address recorded on an existing order." },
  { id: "profile", topic: "account", question: "How can I update my profile?", answer: "Open Profile and choose Edit profile to update your account details." }
];

export function searchSupportFaqs(query = "", topic = null) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return SUPPORT_FAQS.filter((faq) => (!topic || faq.topic === topic) && terms.every((term) => `${faq.question} ${faq.answer}`.toLowerCase().includes(term)));
}

export function supportOrderReference(order) {
  return order?.paymentResult?.payment?.orderNumber || order?.paymentResult?.payment?.orderPublicId || order?.paymentResult?.order?.orderNumber || order?.paymentResult?.order?.orderPublicId || order?.id;
}

export function supportEmailUrl({ topic, message, order }) {
  const title = SUPPORT_TOPICS.find((item) => item.id === topic)?.title || "General enquiry";
  const reference = supportOrderReference(order);
  const subject = `Just Harvst support: ${title}${reference ? ` — Order #${reference}` : ""}`;
  const body = [
    `Topic: ${title}`,
    ...(reference ? [`Order: #${reference}`, ...(order.id !== reference ? [`App order ID: ${order.id}`] : [])] : []),
    "", message.trim()
  ].join("\n");
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
