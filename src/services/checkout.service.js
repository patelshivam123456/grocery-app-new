import { NativeModules } from "react-native";
import { paymentService } from "./payment.service";

const RAZORPAY_KEY_ID = "rzp_test_TJDWj6pZSsjJGI";

function toPaise(amount) {
  return Math.round(Number(amount || 0) * 100);
}

function createPaymentOrder(amount) {
  const orderNumber = Date.now().toString().slice(-6);
  const orderPublicId = `FD${orderNumber}`;
  return {
    orderPublicId,
    orderNumber,
    amount: toPaise(amount),
    receipt: `receipt-${orderPublicId}`
  };
}

function getPaymentOrderNumber(order) {
  return order.orderNumber || order.orderPublicId;
}

function getLineVariantName(line) {
  return line.unit?.variantName || line.unit?.label || line.product?.selectedVariant?.variantName || line.product?.selectedVariant?.label || line.product?.quantity || "";
}

function createOrderDto(input, amount) {
  const productVariantAndItemMap = (input.lines || []).map((line) => ({
    productVariantPublicId: line.unit?.productVariantPublicId || line.unit?.id || line.product?.selectedVariant?.productVariantPublicId || line.product?.selectedVariant?.id || line.productId,
    productVariantName: getLineVariantName(line),
    numberOfItems: String(line.qty)
  }));

  return {
    productVariantAndItemMap,
    totalItems: productVariantAndItemMap.length,
    totalCost: amount
  };
}

function normalizeInitiateResponse(response) {
  const payload = response?.data || response || {};
  return {
    razorpayKeyId: payload.razorpayKeyId || payload.keyId || payload.key,
    razorpayOrderId: payload.razorpayOrderId || payload.orderId,
    paymentPublicId: payload.paymentPublicId,
    orderPublicId: payload.orderPublicId,
    razorpayOrderStatus: payload.razorpayOrderStatus,
    orderNumber: payload.orderNumber,
    currency: payload.currency || "INR",
    status: payload.paymentStatus || payload.razorpayOrderStatus || payload.status || "created",
    amount: Number(payload.amount || 0),
    amountInPaise: Number(payload.amountInPaise || payload.amount_in_paise || payload.amountDue || payload.amount || 0)
  };
}

async function openRazorpayCheckout({ initiated, order, input, amountInPaise }) {
  if (!initiated.razorpayOrderId) {
    throw new Error("Unable to start payment. Razorpay order id was not returned.");
  }
  if (!NativeModules.RNRazorpayCheckout) {
    throw new Error("Razorpay is not available in this build. Please run a native Expo development build.");
  }

  const RazorpayCheckout = require("react-native-razorpay").default;
  return RazorpayCheckout.open({
    key: initiated.razorpayKeyId || RAZORPAY_KEY_ID,
    order_id: initiated.razorpayOrderId,
    amount: String(amountInPaise),
    currency: initiated.currency || "INR",
    name: "Just Harvst",
    description: `Order ${order.orderPublicId}`,
    prefill: {
      contact: input.userMobile || "",
      email: "",
      name: ""
    },
    notes: {
      orderPublicId: order.orderPublicId,
      receipt: order.receipt
    },
    theme: {
      color: "#2E7D32"
    }
  });
}

export async function completeCheckoutPayment(input) {
  if (input.paymentMethod === "COD") {
    const order = {
      orderPublicId: `local-${Date.now()}`,
      orderNumber: null,
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

  const order = createPaymentOrder(input.total);

  let initiated;
  try {
    const orderNumber = getPaymentOrderNumber(order);
    const initiatedResponse = await paymentService.initiate({
      receipt: order.receipt,
      amount: order.amount,
      orderNumber,
      orderDto: createOrderDto(input, order.amount)
    });
    initiated = normalizeInitiateResponse(initiatedResponse);
  } catch (error) {
    throw error;
  }

  const amount = initiated.amount || order.amount;
  const amountInPaise = initiated.amountInPaise || amount;
  const razorpayResult = await openRazorpayCheckout({ initiated, order, input, amountInPaise });
  const acknowledgePayload = {
    paymentPublicId: initiated.paymentPublicId,
    orderPublicId: initiated.orderPublicId || order.orderPublicId,
    razorpayOrderId: initiated.razorpayOrderId,
    razorpayPaymentId: razorpayResult.razorpay_payment_id,
    razorpaySignature: razorpayResult.razorpay_signature
  };

  const acknowledged = await paymentService.acknowledge(acknowledgePayload);
  return { order, payment: initiated, acknowledgement: acknowledged, acknowledgePayload };
}
