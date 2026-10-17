import test from "node:test";
import assert from "node:assert/strict";
import { SUPPORT_FAQS, searchSupportFaqs, supportEmailUrl, supportOrderReference } from "../src/services/support.js";

test("help search matches questions and answers and combines with selected topics", () => {
  assert.equal(searchSupportFaqs().length, SUPPORT_FAQS.length);
  assert.deepEqual(searchSupportFaqs(" CANCEL ", "orders").map((faq) => faq.id), ["cancel"]);
  assert.deepEqual(searchSupportFaqs("photos", "items").map((faq) => faq.id), ["quality"]);
  assert.deepEqual(searchSupportFaqs("payment", "account"), []);
  assert.deepEqual(searchSupportFaqs("unmatched search"), []);
});

test("support drafts include the attached order reference and safely encode message text", () => {
  const order = { id: "FD42", paymentResult: { payment: { orderNumber: "JH-100" } } };
  const message = "Rice & milk?\nMissing 1 item + broken pack.";
  const url = new URL(supportEmailUrl({ topic: "items", order, message }));
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.searchParams.get("subject"), "Just Harvst support: Items & quality — Order #JH-100");
  assert.equal(url.searchParams.get("body"), `Topic: Items & quality\nOrder: #JH-100\nApp order ID: FD42\n\n${message}`);
  assert.equal(url.searchParams.has("cc"), false);
});

test("general enquiries do not invent an order reference", () => {
  const url = new URL(supportEmailUrl({ message: "  Please help me update my profile.  " }));
  assert.equal(url.searchParams.get("subject"), "Just Harvst support: General enquiry");
  assert.equal(url.searchParams.get("body"), "Topic: General enquiry\n\nPlease help me update my profile.");
  assert.equal(supportOrderReference({ id: "FD42" }), "FD42");
  assert.equal(supportOrderReference(null), undefined);
});
