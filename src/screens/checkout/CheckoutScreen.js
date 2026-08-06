import React from "react";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../components/AppButton";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { completeCheckoutPayment } from "../../services/checkout.service";
import { addToCart, clearCart, decrementCart, setDeliveryInstruction, setPaymentMethod } from "../../store/slices/cartSlice";
import { placeOrder } from "../../store/slices/orderSlice";
import { showToast } from "../../store/slices/appSlice";
import { FREE_DELIVERY_MIN, selectCartLines, selectCartTotals, selectSelectedAddress } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const paymentMethods = ["UPI", "Card", "COD", "Wallet"];

export default function CheckoutScreen({ navigation }) {
  const lines = useSelector(selectCartLines);
  const totals = useSelector(selectCartTotals);
  const address = useSelector(selectSelectedAddress);
  const instruction = useSelector((state) => state.cart.deliveryInstruction);
  const paymentMethod = useSelector((state) => state.cart.paymentMethod);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const mobile = useSelector((state) => state.auth.mobile);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const remainingForFreeDelivery = Math.max(FREE_DELIVERY_MIN - totals.subtotal, 0);
  const freeDeliveryProgress = Math.min(totals.subtotal / FREE_DELIVERY_MIN, 1);
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("HomeFeed"));
  const placeOrderNow = async (loggedInMobile = mobile) => {
    if (placingOrder) return;
    try {
      setPlacingOrder(true);
      const paymentResult = await completeCheckoutPayment({ lines, total: totals.total, address, instruction, paymentMethod, userMobile: loggedInMobile });
      dispatch(placeOrder({ lines, total: totals.total, address, instruction, paymentMethod, userMobile: loggedInMobile, paymentResult }));
      dispatch(clearCart());
      navigation.replace("OrderSuccess");
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to place order. Please try again."));
    } finally {
      setPlacingOrder(false);
    }
  };
  const submit = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    placeOrderNow();
  };
  const selectPaymentMethod = (method) => {
    dispatch(setPaymentMethod(method));
    setPaymentOpen(false);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconCircle}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Pressable style={styles.iconCircle}><Text style={styles.headerIcon}>⌕</Text></Pressable>
        <Pressable onPress={() => Share.share({ message: `Just Harvst cart total ₹${totals.total}` })} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>↗</Text>
          <Text numberOfLines={1} style={styles.shareText}>Share</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Section title="Delivery address">
          <Pressable onPress={() => navigation.navigate("Addresses")} style={styles.addressRow}>
            <Text style={styles.pin}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>Delivering to {address?.label || "Other"}</Text>
              <Text numberOfLines={1} style={styles.body}>{address ? `${address.line1}, ${address.city}` : "Add delivery address"}</Text>
            </View>
            <Text style={styles.link}>Change</Text>
          </Pressable>
        </Section>

        <Section title="Delivery instructions">
          <TextInput
            value={instruction}
            onChangeText={(text) => dispatch(setDeliveryInstruction(text))}
            placeholder="Leave at door, call on arrival..."
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Section>

        <Section title={`Cart items • ${totals.count}`}>
          <View style={styles.deliveryRow}>
            <Text style={styles.clock}>◷</Text>
            <View>
              <Text style={styles.strong}>Delivery in 15 minutes</Text>
              <Text style={styles.body}>Shipment of {totals.count} items</Text>
            </View>
          </View>
          {lines.map(({ cartKey, product, productId, unit, qty, lineTotal }, index) => (
            <View key={cartKey} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
              <View style={styles.itemImage}>
                <SafeRemoteImage uri={product.imageGallery?.[0]} style={styles.itemPhoto} fallback={product.image} fallbackStyle={styles.itemEmoji} />
              </View>
              <View style={styles.itemCopy}>
                <Text numberOfLines={2} style={styles.itemName}>{product.name}</Text>
                <Text style={styles.body}>{product.quantity}</Text>
                <Text style={styles.wishlist}>Move to wishlist</Text>
              </View>
              <View style={styles.qtyBlock}>
                <View style={styles.stepper}>
                  <Pressable onPress={() => dispatch(decrementCart(cartKey))}><Text style={styles.stepText}>−</Text></Pressable>
                  <Text style={styles.stepText}>{qty}</Text>
                  <Pressable onPress={() => dispatch(addToCart(unit ? { productId, unit } : productId))}><Text style={styles.stepText}>+</Text></Pressable>
                </View>
                <Text style={styles.price}>₹{lineTotal}</Text>
              </View>
            </View>
          ))}
        </Section>

        <View style={styles.deliveryPromo}>
          <Text style={styles.promoIcon}>🛵</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>{remainingForFreeDelivery ? "Get FREE delivery" : "FREE delivery unlocked"}</Text>
            <Text style={styles.body}>{remainingForFreeDelivery ? `Add products worth ₹${remainingForFreeDelivery} more` : "Nice, delivery charge is on us"}</Text>
            <View style={styles.progress}><View style={[styles.progressFill, { width: `${freeDeliveryProgress * 100}%` }]} /></View>
          </View>
        </View>

        <Section title="Coupon section">
          <View style={styles.couponRow}>
            <Coupon code="SAVE50" detail="₹50 off above ₹299" />
            <Coupon code="FRESH20" detail="₹20 off above ₹149" />
          </View>
        </Section>

        <Section title="Bill summary">
          <BillRow label="Items total" value={`₹${totals.subtotal}`} />
          <BillRow label="Delivery charge" value={totals.delivery ? `₹${totals.delivery}` : "FREE"} />
          <BillRow label="Handling charge" value={`₹${totals.platform}`} />
          <BillRow label="Coupon discount" value={`-₹${totals.discount}`} />
          <View style={styles.totalLine}>
            <Text style={styles.totalText}>Grand total</Text>
            <Text style={styles.totalText}>₹{totals.total}</Text>
          </View>
        </Section>

        <Section title="Payment method">
          <Pressable onPress={() => navigation.navigate("Payment")} style={styles.paymentRow}>
            <Text style={styles.walletIcon}>₹</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>{paymentMethod}</Text>
              <Text style={styles.body}>Tap to change payment method</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        </Section>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <Pressable onPress={() => setPaymentOpen(true)} style={styles.payUsing}>
          <Text style={styles.paySmall}>PAY USING</Text>
          <Text style={styles.payMethod}>{paymentMethod}</Text>
        </Pressable>
        <AppButton title={`₹${totals.total}  Place Order ›`} onPress={submit} loading={placingOrder} style={styles.placeOrder} />
      </View>
      <Modal visible={paymentOpen} transparent animationType="slide" onRequestClose={() => setPaymentOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setPaymentOpen(false)}>
          <Pressable style={[styles.paymentSheet, { paddingBottom: 14 + insets.bottom }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select payment method</Text>
            {paymentMethods.map((method) => {
              const active = method === paymentMethod;
              return (
                <Pressable key={method} onPress={() => selectPaymentMethod(method)} style={[styles.sheetOption, active && styles.sheetOptionActive]}>
                  <View style={styles.sheetIcon}><Text style={styles.sheetIconText}>{method.slice(0, 1)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetMethod, active && styles.sheetMethodActive]}>{method}</Text>
                    <Text style={[styles.sheetHint, active && styles.sheetHintActive]}>{method === "COD" ? "Pay when groceries arrive" : "Use this payment method"}</Text>
                  </View>
                  <Text style={[styles.sheetCheck, active && styles.sheetCheckActive]}>{active ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={placeOrderNow} />
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Coupon({ code, detail }) {
  return (
    <Pressable style={styles.coupon}>
      <Text style={styles.couponCode}>{code}</Text>
      <Text style={styles.body}>{detail}</Text>
    </Pressable>
  );
}

function BillRow({ label, value }) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={styles.billValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F5FA" },
  header: { height: 52, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.faint },
  backText: { fontSize: 26, lineHeight: 28, color: colors.text },
  headerIcon: { fontSize: type.heading, color: colors.text, fontWeight: "900" },
  headerTitle: { flex: 1, minWidth: 0, fontSize: type.heading, fontWeight: "900", color: colors.text },
  shareBtn: { height: 34, maxWidth: 88, borderRadius: 17, backgroundColor: colors.surface, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.faint, flexDirection: "row", gap: 5 },
  shareIcon: { color: colors.text, fontWeight: "900", fontSize: type.body },
  shareText: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  content: { padding: 12, gap: 10, paddingBottom: 92 },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 9, borderWidth: 1, borderColor: colors.faint },
  sectionTitle: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pin: { fontSize: 24 },
  strong: { fontSize: type.subheading, color: colors.text, fontWeight: "900", lineHeight: 15 },
  body: { color: colors.muted, fontSize: type.body, lineHeight: 14 },
  link: { color: colors.primary, fontWeight: "900", fontSize: type.subheading },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.faint, borderRadius: 8, paddingHorizontal: 10, color: colors.text, fontSize: type.body },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 2 },
  clock: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#EDF8E9", textAlign: "center", textAlignVertical: "center", color: colors.primaryDark, fontWeight: "900" },
  itemRow: { flexDirection: "row", gap: 9, paddingTop: 8 },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.faint },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.faint },
  itemPhoto: { width: "100%", height: "100%", borderRadius: 7 },
  itemEmoji: { fontSize: 30 },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { fontSize: type.heading, fontWeight: "900", color: colors.text, lineHeight: 16 },
  wishlist: { marginTop: 3, color: colors.muted, textDecorationLine: "underline", fontSize: type.body },
  qtyBlock: { alignItems: "flex-end", gap: 5 },
  stepper: { width: 76, height: 34, borderRadius: 8, backgroundColor: colors.primaryDark, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  stepText: { color: "#fff", fontSize: type.heading, fontWeight: "900" },
  price: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  deliveryPromo: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F9FCFF", borderRadius: 8, borderWidth: 1, borderColor: "#E4EEF8", padding: 12 },
  promoIcon: { fontSize: 26 },
  promoTitle: { color: "#2B7DE9", fontWeight: "900", fontSize: type.heading },
  progress: { height: 4, backgroundColor: "#E7EEF8", borderRadius: 4, marginTop: 6, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: "#2B7DE9" },
  couponRow: { flexDirection: "row", gap: 8 },
  coupon: { flex: 1, backgroundColor: "#FFF7DF", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#F9D77E" },
  couponCode: { fontWeight: "900", color: colors.orange, fontSize: type.heading },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { color: colors.muted, fontSize: type.subheading },
  billValue: { color: colors.text, fontWeight: "800", fontSize: type.subheading },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.faint, paddingTop: 9, marginTop: 2, flexDirection: "row", justifyContent: "space-between" },
  totalText: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  walletIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#EEF6FF", textAlign: "center", textAlignVertical: "center", color: colors.info, fontWeight: "900" },
  chev: { fontSize: 20, color: colors.muted },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 62, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingTop: 6 },
  payUsing: { minWidth: 86 },
  paySmall: { color: colors.muted, fontSize: type.body },
  payMethod: { color: colors.text, fontWeight: "900", marginTop: 2, fontSize: type.subheading },
  placeOrder: { flex: 1, borderRadius: 12, backgroundColor: "#218A10" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.22)", justifyContent: "flex-end" },
  paymentSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  sheetHandle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.faint, marginBottom: 4 },
  sheetTitle: { fontSize: type.heading, color: colors.text, fontWeight: "900", marginBottom: 2 },
  sheetOption: { minHeight: 58, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: colors.surface },
  sheetOptionActive: { borderColor: colors.primary, backgroundColor: "#F0FFF4" },
  sheetIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEF6FF", alignItems: "center", justifyContent: "center" },
  sheetIconText: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  sheetMethod: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  sheetMethodActive: { color: colors.primaryDark },
  sheetHint: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  sheetHintActive: { color: colors.primaryDark },
  sheetCheck: { width: 22, color: colors.muted, fontSize: type.heading, fontWeight: "900", textAlign: "center" },
  sheetCheckActive: { color: colors.primaryDark }
});
