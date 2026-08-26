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

function getLineVariantName(line) {
  return line.unit?.variantName || line.unit?.label || line.product?.selectedVariant?.variantName || line.product?.selectedVariant?.label || line.product?.quantity || "";
}

function getPublicId(value) {
  return value?.publicId || value?.userPublicId || value?.customerPublicId || value?.customerId || value?.id || "";
}

function getCustomerName(input) {
  return input.customerName || input.customer?.name || input.customer?.customerName || input.customer?.username || input.userName || "";
}

function createCheckoutPayload(input, order) {
  const productVariantAndItemMap = (input.lines || []).map((line) => ({
    productVariantPublicId: line.unit?.productVariantPublicId || line.unit?.id || line.product?.selectedVariant?.productVariantPublicId || line.product?.selectedVariant?.id || line.productId,
    productVariantName: getLineVariantName(line),
    numberOfItems: String(line.qty),
    productName: line.product?.name || ""
  }));

  return {
    userPublicId: input.userPublicId || getPublicId(input.customer),
    orderPublicId: order.orderPublicId,
    orderNumber: order.orderNumber,
    customerName: getCustomerName(input),
    productVariantAndItemMap,
    totalItems: productVariantAndItemMap.length,
    totalCost: order.amount,
    orderStatus: "created",
    couponCode: input.coupon?.title || input.coupon?.code || ""
  };
}

function getWalletAmount(input) {
  if (input.paymentMethod !== "UPI" && input.paymentMethod !== "Wallet") return 0;
  return Math.min(Number(input.walletAmount || 0), Number(input.total || 0));
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
        amountInPaise: input.total * 100,
        walletAmount: 0
      }
    };
  }

  const walletAmount = getWalletAmount(input);
  const payableTotal = Math.max(Number(input.total || 0) - walletAmount, 0);
  const order = createPaymentOrder(payableTotal);

  if (payableTotal <= 0) {
    return {
      order,
      payment: { currency: "INR", status: "wallet", walletAmount },
      acknowledgement: null,
      acknowledgePayload: {
        orderPublicId: order.orderPublicId,
        receipt: order.receipt,
        currency: "INR",
        status: "wallet",
        acknowledgedAt: new Date().toISOString(),
        amount: payableTotal,
        amountInPaise: 0,
        walletAmount
      }
    };
  }

  let initiated;
  try {
    const initiatedResponse = await paymentService.initiate(createCheckoutPayload(input, order));
    initiated = normalizeInitiateResponse(initiatedResponse);
  } catch (error) {
    throw error;
  }

  const amountInPaise = order.amount;
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
