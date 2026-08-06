import { orderService } from "./order.service";
import { paymentService } from "./payment.service";

function buildOrderPayload({ lines, total, address, instruction, paymentMethod, userMobile }) {
  return {
    amount: total,
    totalAmount: total,
    receipt: `rcpt_${Date.now()}`,
    customerMobile: userMobile,
    paymentMethod,
    deliveryInstruction: instruction,
    address,
    items: lines.map((line) => ({
      productPublicId: line.productId,
      productName: line.product.name,
      quantity: line.qty,
      amount: line.lineTotal,
      variantPublicId: line.unit?.id || line.unit?.productVariantPublicId
    }))
  };
}

function normalizeOrderResponse(response, fallbackAmount) {
  const payload = response?.data || response || {};
  return {
    orderPublicId: payload.orderPublicId || payload.order?.orderPublicId || payload.id,
    amount: Number(payload.amount || payload.totalAmount || fallbackAmount),
    receipt: payload.receipt || payload.order?.receipt || `rcpt_${Date.now()}`
  };
}

function normalizeInitiateResponse(response) {
  const payload = response?.data || response || {};
  return {
    razorpayKeyId: payload.razorpayKeyId || payload.keyId || payload.key,
    razorpayOrderId: payload.razorpayOrderId || payload.orderId,
    currency: payload.currency || "INR",
    status: payload.status || "created",
    amount: Number(payload.amount || 0),
    amountInPaise: Number(payload.amountInPaise || payload.amount_in_paise || 0)
  };
}

export async function completeCheckoutPayment(input) {
  if (input.paymentMethod === "COD") {
    const order = {
      orderPublicId: `local-${Date.now()}`,
      amount: input.total,
      receipt: `cod_${Date.now()}`
    };
    return {
      order,
      payment: { currency: "INR", status: "cod" },
      acknowledgement: null,
      acknowledgePayload: {
        orderPublicId: order.orderPublicId,
        receipt: order.receipt,
        currency: "INR",
        status: "cod",
        acknowledgedAt: new Date().toISOString(),
        amount: input.total,
        amountInPaise: input.total * 100
      }
    };
  }

  const orderPayload = buildOrderPayload(input);
  let order;
  try {
    const orderResponse = await orderService.create(orderPayload);
    order = normalizeOrderResponse(orderResponse, input.total);
  } catch (error) {
    order = {
      orderPublicId: `local-${Date.now()}`,
      amount: input.total,
      receipt: orderPayload.receipt
    };
  }
  if (!order.orderPublicId) {
    order = {
      orderPublicId: `local-${Date.now()}`,
      amount: input.total,
      receipt: orderPayload.receipt
    };
  }

  let initiated;
  try {
    const initiatedResponse = await paymentService.initiate({
      orderPublicId: order.orderPublicId,
      receipt: order.receipt,
      amount: order.amount
    });
    initiated = normalizeInitiateResponse(initiatedResponse);
  } catch (error) {
    initiated = { currency: "INR", status: "created", amount: order.amount, amountInPaise: order.amount * 100 };
  }

  const amount = initiated.amount || order.amount;
  const amountInPaise = initiated.amountInPaise || amount * 100;
  const acknowledgePayload = {
    razorpayKeyId: initiated.razorpayKeyId,
    razorpayOrderId: initiated.razorpayOrderId,
    orderPublicId: order.orderPublicId,
    receipt: order.receipt,
    currency: initiated.currency || "INR",
    status: initiated.status || "created",
    razorpayPaymentId: null,
    razorpaySignature: null,
    paymentStatus: null,
    signatureVerified: false,
    acknowledgedAt: new Date().toISOString(),
    amount,
    amountInPaise
  };

  let acknowledged = null;
  try {
    acknowledged = await paymentService.acknowledge(acknowledgePayload);
  } catch (error) {
    acknowledged = { skipped: true };
  }
  return { order, payment: initiated, acknowledgement: acknowledged, acknowledgePayload };
}
