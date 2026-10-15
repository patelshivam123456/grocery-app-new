import React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import CouponFeedbackModal from "../../components/CouponFeedbackModal";
import { coupons } from "../../data/mockData";
import { completeCheckoutPayment } from "../../services/checkout.service";
import { addToCart, applyCoupon, clearCart, decrementCart, setPaymentMethod } from "../../store/slices/cartSlice";
import { placeOrder } from "../../store/slices/orderSlice";
import { showToast } from "../../store/slices/appSlice";
import { debitWalletMoney } from "../../store/slices/userSlice";
import { FREE_DELIVERY_MIN, selectCartLines, selectCartTotals, selectSelectedAddress, selectVisibleWalletBalance } from "../../store/selectors";

const paymentMethods = ["UPI", "COD"];
const validPaymentMethods = [...paymentMethods, "Wallet"];

export default function CheckoutScreen({ navigation }) {
  const lines = useSelector(selectCartLines);
  const totals = useSelector(selectCartTotals);
  const address = useSelector(selectSelectedAddress);
  const instruction = useSelector((state) => state.cart.deliveryInstruction);
  const paymentMethod = useSelector((state) => state.cart.paymentMethod);
  const activeCoupon = useSelector((state) => state.cart.coupon);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const mobile = useSelector((state) => state.auth.mobile);
  const customer = useSelector((state) => state.auth.customer);
  const userName = useSelector((state) => state.user.name);
  const walletBalance = useSelector(selectVisibleWalletBalance);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [couponFeedback, setCouponFeedback] = React.useState(null);
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const [walletSelected, setWalletSelected] = React.useState(paymentMethod === "UPI" && walletBalance > 0);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const remainingForFreeDelivery = Math.max(FREE_DELIVERY_MIN - totals.subtotal, 0);
  const freeDeliveryProgress = Math.min(totals.subtotal / FREE_DELIVERY_MIN, 1);
  const walletEnabled = (paymentMethod === "UPI" || paymentMethod === "Wallet") && walletBalance > 0;
  const walletAmount = walletEnabled && walletSelected ? Math.min(walletBalance, totals.total) : 0;
  const payableAmount = Math.max(totals.total - walletAmount, 0);
  const walletCoversTotal = walletEnabled && walletSelected && totals.total > 0 && totals.total <= walletBalance;
  const effectivePaymentMethod = walletCoversTotal ? "Wallet" : paymentMethod === "Wallet" ? "UPI" : paymentMethod;
  React.useEffect(() => {
    if (!validPaymentMethods.includes(paymentMethod)) {
      dispatch(setPaymentMethod("UPI"));
      setWalletSelected(walletBalance > 0);
      return;
    }
    if (paymentMethod === "COD" || walletBalance <= 0) {
      if (walletSelected) setWalletSelected(false);
      return;
    }
    if (!walletSelected && paymentMethod === "Wallet") {
      dispatch(setPaymentMethod("UPI"));
      return;
    }
    if (!walletSelected) return;
    if (walletCoversTotal && paymentMethod !== "Wallet") {
      dispatch(setPaymentMethod("Wallet"));
      return;
    }
    if (!walletCoversTotal && paymentMethod === "Wallet") dispatch(setPaymentMethod("UPI"));
  }, [dispatch, paymentMethod, walletBalance, walletCoversTotal, walletSelected]);
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("HomeFeed"));
  const placeOrderNow = async (loggedInMobile = mobile) => {
    if (placingOrder) return;
    try {
      setPlacingOrder(true);
      const paymentResult = await completeCheckoutPayment({ lines, total: totals.total, address, instruction, paymentMethod: effectivePaymentMethod, userMobile: loggedInMobile, customer, userName, coupon: activeCoupon, walletAmount });
      if (walletAmount > 0) dispatch(debitWalletMoney(walletAmount));
      dispatch(placeOrder({ lines, total: totals.total, address, instruction, paymentMethod: effectivePaymentMethod, userMobile: loggedInMobile, paymentResult, walletAmount }));
      dispatch(clearCart());
      navigation.replace("OrderSuccess", { orderNumber: paymentResult.payment?.orderNumber || paymentResult.payment?.orderPublicId || paymentResult.order?.orderNumber || paymentResult.order?.orderPublicId });
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
    setWalletSelected(method === "UPI" && walletBalance > 0);
    setPaymentOpen(false);
  };
  const toggleWallet = () => {
    if (!walletEnabled) return;
    setWalletSelected((selected) => !selected);
  };
  const chooseCoupon = (coupon) => {
    if (activeCoupon?.id === coupon.id) {
      dispatch(applyCoupon(null));
      return;
    }
    if (totals.subtotal < coupon.min) {
      setCouponFeedback({ type: "unavailable", coupon, remaining: coupon.min - totals.subtotal });
      return;
    }
    dispatch(applyCoupon(coupon));
    setCouponFeedback({ type: "success", coupon });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to cart" onPress={goBack} style={styles.iconCircle}><Feather name="arrow-left" size={21} color="#304735" /></Pressable>
        <View style={styles.headerCopy}><Text accessibilityRole="header" style={styles.headerTitle}>Checkout</Text><Text style={styles.headerSubtitle}>Review your fresh picks</Text></View>
        <View style={styles.countBadge}><Feather name="shopping-bag" size={12} color="#347448" /><Text style={styles.countText}>{totals.count} {totals.count === 1 ? "item" : "items"}</Text></View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <Section title="Delivery details" icon="map-pin">
          <Pressable accessibilityRole="button" accessibilityLabel="Change delivery address" onPress={() => navigation.navigate("Addresses")} style={styles.addressRow}>
            <View style={styles.addressIcon}><Feather name="home" size={22} color="#347448" /></View>
            <View style={styles.flex}><Text style={styles.strong}>{address ? `Deliver to ${address.label}` : "Choose your delivery address"}</Text><Text numberOfLines={2} style={styles.body}>{address ? [address.line1, address.city].filter(Boolean).join(", ") : "Tell us where your groceries should arrive"}</Text></View>
            <Text style={styles.link}>Change</Text><Feather name="chevron-right" size={15} color="#347448" />
          </Pressable>
          <View style={styles.deliveryTime}><Feather name="clock" size={13} color="#638157" /><Text style={styles.deliveryTimeText}>Estimated delivery in 8–15 minutes</Text></View>
          {instruction ? <View style={styles.instruction}><Feather name="message-square" size={13} color="#8A9583" /><Text style={[styles.body, styles.flex]}>{instruction}</Text></View> : null}
        </Section>

        <View accessibilityLabel="Free delivery offer" style={styles.deliveryPromo}>
          <View style={styles.promoIcon}><Feather name="truck" size={25} color="#258749" /></View>
          <View style={styles.flex}><View style={styles.promoTitleRow}><Text style={styles.promoTitle}>{remainingForFreeDelivery ? "A little more. Free delivery." : "Free delivery unlocked!"}</Text>{!remainingForFreeDelivery ? <Feather name="check-circle" size={15} color="#258749" /> : null}</View><Text style={styles.promoSubtitle}>{remainingForFreeDelivery ? `Add ₹${remainingForFreeDelivery} more to your basket` : "Your delivery charge is on us"}</Text><View accessible accessibilityRole="progressbar" accessibilityLabel="Free delivery progress" accessibilityValue={{min:0,max:FREE_DELIVERY_MIN,now:Math.min(totals.subtotal,FREE_DELIVERY_MIN)}} style={styles.progress}><View style={[styles.progressFill, { width: `${freeDeliveryProgress * 100}%` }]} /></View></View>
        </View>

        <Section title="Your basket" icon="shopping-bag" detail={`${totals.count} ${totals.count === 1 ? "item" : "items"}`}>
          {lines.map(({ cartKey, product, productId, unit, qty, lineTotal }, index) => (
            <View key={cartKey} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name}`} onPress={() => navigation.navigate("ProductDetails", { productId })} style={styles.itemInfo}>
                <View style={styles.itemImage}><SafeRemoteImage uri={product.imageGallery?.[0] || product.image} style={styles.itemPhoto} resizeMode="contain" fallback={product.image} fallbackStyle={styles.itemEmoji} /></View>
                <View style={styles.itemCopy}><Text numberOfLines={2} style={styles.itemName}>{product.name}</Text><Text style={styles.itemQuantity}>{product.quantity}</Text><View style={styles.itemPrices}><Text style={styles.price}>₹{lineTotal}</Text>{product.mrp > product.price ? <Text style={styles.mrp}>₹{product.mrp * qty}</Text> : null}</View></View>
              </Pressable>
              <View style={styles.stepper}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${product.name} quantity`} onPress={() => dispatch(decrementCart(cartKey))} style={styles.stepButton}><Feather name="minus" size={14} color="#FFFFFF" /></Pressable>
                <Text style={styles.stepText}>{qty}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${product.name} quantity`} onPress={() => dispatch(addToCart(unit ? { productId, unit } : productId))} style={styles.stepButton}><Feather name="plus" size={14} color="#FFFFFF" /></Pressable>
              </View>
            </View>
          ))}
        </Section>

        <Section title="Coupons & offers" icon="percent" tone="purple">
          <Text style={styles.sectionSubtitle}>A little extra savings for your basket</Text>
          <View style={styles.couponRow}>
            {coupons.map((coupon, index) => <Coupon key={coupon.id} code={coupon.title} discount={coupon.discount} minimum={coupon.min} warm={index % 2 === 1} active={activeCoupon?.id === coupon.id} onPress={() => chooseCoupon(coupon)} />)}
          </View>
          {activeCoupon ? <View style={styles.appliedCoupon}><Feather name={totals.discount > 0 ? "check-circle" : "info"} size={13} color="#347448" /><Text style={styles.appliedCouponText}>{totals.discount > 0 ? `${activeCoupon.title} saved you ₹${totals.discount}. Tap again to remove.` : `Add ₹${Math.max(activeCoupon.min - totals.subtotal, 0)} more to use ${activeCoupon.title}. Tap again to remove.`}</Text></View> : null}
        </Section>

        <Section title="Payment method" icon="credit-card">
          <Pressable accessibilityRole="button" accessibilityLabel="Change payment method" onPress={() => navigation.navigate("Payment")} style={styles.paymentRow}>
            <View style={styles.paymentIcon}><Feather name={effectivePaymentMethod === "COD" ? "dollar-sign" : effectivePaymentMethod === "Wallet" ? "briefcase" : "smartphone"} size={21} color="#446A8F" /></View>
            <View style={styles.flex}><Text style={styles.strong}>{effectivePaymentMethod === "COD" ? "Cash on delivery" : effectivePaymentMethod === "Wallet" ? "Wallet balance" : "Pay with UPI"}</Text><Text style={styles.body}>{effectivePaymentMethod === "COD" ? "Pay when your groceries arrive" : "Choose how you'd like to pay"}</Text></View>
            <Text style={styles.link}>Change</Text><Feather name="chevron-right" size={15} color="#347448" />
          </Pressable>
          <Pressable accessibilityRole="checkbox" accessibilityLabel="Use wallet balance" accessibilityState={{ checked: walletSelected && walletEnabled, disabled: !walletEnabled }} onPress={toggleWallet} disabled={!walletEnabled} style={[styles.walletRow, !walletEnabled && styles.walletRowDisabled]}>
            <View style={[styles.checkbox, walletSelected && walletEnabled && styles.checkboxActive]}>{walletSelected && walletEnabled ? <Feather name="check" size={12} color="#FFFFFF" /> : null}</View>
            <View style={styles.flex}><Text style={styles.walletTitle}>Use Fresh Money</Text><Text style={styles.walletSubtitle}>{paymentMethod === "COD" ? "Wallet is unavailable with cash on delivery" : walletBalance > 0 ? `Available balance ₹${walletBalance}` : "No wallet balance available"}</Text></View>
            {walletAmount > 0 ? <Text style={styles.walletDeduction}>−₹{walletAmount}</Text> : null}
          </Pressable>
        </Section>

        <Section title="Bill details" icon="file-text">
          <BillRow label="Items total" value={`₹${totals.subtotal}`} />
          <BillRow label="Delivery charge" value={totals.delivery ? `₹${totals.delivery}` : "FREE"} positive={!totals.delivery} />
          <BillRow label="Handling charge" value={`₹${totals.platform}`} />
          {totals.discount > 0 ? <BillRow label="Coupon discount" value={`−₹${totals.discount}`} positive /> : null}
          {walletAmount > 0 ? <BillRow label="Wallet contribution" value={`−₹${walletAmount}`} positive /> : null}
          <View style={styles.totalLine}><Text style={styles.totalText}>{effectivePaymentMethod === "COD" ? "Pay on delivery" : "To pay"}</Text><Text style={styles.totalText}>₹{payableAmount}</Text></View>
          {totals.discount > 0 ? <View style={styles.savingsBanner}><Feather name="smile" size={14} color="#347448" /><Text style={styles.savingsText}>You're saving ₹{totals.discount} with your coupon</Text></View> : null}
        </Section>
        <View style={styles.footerNote}><Feather name="shopping-bag" size={16} color="#A0AB98" /><Text style={styles.footerText}>Fresh picks. One happy doorstep.</Text></View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose payment method" onPress={() => setPaymentOpen(true)} style={styles.payUsing}><View style={styles.payCaption}><Text style={styles.paySmall}>PAY USING</Text><Feather name="chevron-up" size={12} color="#8B9683" /></View><Text style={styles.payMethod}>{effectivePaymentMethod}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Place order, payable ₹${payableAmount}`} disabled={placingOrder || !lines.length} onPress={submit} style={[styles.placeOrder, (placingOrder || !lines.length) && styles.placeOrderDisabled]}>
          {placingOrder ? <ActivityIndicator color="#FFFFFF" /> : <><View><Text style={styles.payable}>₹{payableAmount}</Text><Text style={styles.payableLabel}>{effectivePaymentMethod === "COD" ? "ON DELIVERY" : "TO PAY"}</Text></View><View style={styles.placeOrderCopy}><Text style={styles.placeOrderText}>Place order</Text><Feather name="arrow-right" size={18} color="#FFFFFF" /></View></>}
        </Pressable>
      </View>
      <Modal visible={paymentOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setPaymentOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss payment methods" style={StyleSheet.absoluteFillObject} onPress={() => setPaymentOpen(false)} />
          <View style={styles.paymentSheetWrap}>
            <View style={[styles.paymentSheet, { paddingBottom: 16 + insets.bottom }]}>
              <Text accessibilityRole="header" style={styles.sheetTitle}>How would you like to pay?</Text><Text style={styles.sheetSubtitle}>Choose what works for you</Text>
              {paymentMethods.map((method) => {
                const active = method === paymentMethod || (method === "UPI" && paymentMethod === "Wallet");
                return <Pressable key={method} accessibilityRole="radio" accessibilityLabel={method} accessibilityState={{ checked: active }} onPress={() => selectPaymentMethod(method)} style={[styles.sheetOption, active && styles.sheetOptionActive]}><View style={styles.sheetIcon}><Feather name={method === "COD" ? "dollar-sign" : "smartphone"} size={21} color="#347448" /></View><View style={styles.flex}><Text style={styles.sheetMethod}>{method === "COD" ? "Cash on delivery" : "UPI"}</Text><Text style={styles.sheetHint}>{method === "COD" ? "Pay when groceries arrive" : "Pay with your favourite UPI app"}</Text></View><View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View></Pressable>;
              })}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close payment methods" hitSlop={8} style={styles.sheetClose} onPress={() => setPaymentOpen(false)}><Feather name="x" size={22} color="#FFFFFF" /></Pressable>
          </View>
        </View>
      </Modal>
      <CouponFeedbackModal feedback={couponFeedback} onClose={() => setCouponFeedback(null)} buttonLabel="Back to checkout" />
      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={placeOrderNow} />
    </SafeAreaView>
  );
}

function Section({ title, icon, detail, tone, children }) {
  return <View style={styles.card}><View style={styles.sectionHeading}><View style={[styles.sectionIcon, tone === "purple" && styles.purpleIcon]}><Feather name={icon} size={16} color={tone === "purple" ? "#79549B" : "#498056"} /></View><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}</View>{children}</View>;
}

function Coupon({ code, discount, minimum, active, warm, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${active ? "Remove" : "Apply"} coupon ${code}`} onPress={onPress} style={[styles.coupon, warm && styles.couponWarm, active && styles.couponActive]}><View style={styles.couponTop}><Feather name="percent" size={13} color={warm ? "#C37530" : "#498056"} /><Text style={styles.couponFlat}>FLAT</Text></View><Text style={[styles.couponDiscount, warm && styles.couponDiscountWarm]}>₹{discount} OFF</Text><Text style={styles.couponDetail}>On orders of ₹{minimum}+</Text><View style={styles.couponBottom}><Text style={styles.couponCode}>{code}</Text><Feather name={active ? "check-circle" : "plus-circle"} size={16} color="#347448" /></View><Text style={styles.couponAction}>{active ? "Applied · tap to remove" : "Tap to apply"}</Text></Pressable>;
}

function BillRow({ label, value, positive }) {
  return <View style={styles.billRow}><Text style={styles.billLabel}>{label}</Text><Text style={[styles.billValue, positive && styles.positive]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6F2" },
  header: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EAF0E5" },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F5F8F1", alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 21, fontWeight: "800", color: "#283F2E", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 10, color: "#78856E", marginTop: 4 },
  countBadge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: "#EDF6E7", flexDirection: "row", alignItems: "center", gap: 5 },
  countText: { color: "#347448", fontSize: 10, fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 14, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 19, padding: 15, gap: 13 },
  flex: { flex: 1 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  sectionIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: "#EFF6E9", alignItems: "center", justifyContent: "center" },
  purpleIcon: { backgroundColor: "#F4EDF9" },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: "800", color: "#304834" },
  sectionDetail: { color: "#7C886E", fontSize: 10 },
  sectionSubtitle: { color: "#79816E", fontSize: 10, marginTop: -8 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addressIcon: { width: 38, height: 42, borderRadius: 12, backgroundColor: "#F7FAF4", alignItems: "center", justifyContent: "center" },
  strong: { color: "#40533B", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  body: { color: "#75816C", fontSize: 10, lineHeight: 15, marginTop: 4 },
  link: { color: "#347448", fontSize: 10, fontWeight: "700" },
  deliveryTime: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F5F8F0", borderRadius: 8, padding: 9 },
  deliveryTimeText: { color: "#78916B", fontSize: 10 },
  instruction: { flexDirection: "row", alignItems: "center", gap: 7 },
  deliveryPromo: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 15, backgroundColor: "#EAF6E5", borderWidth: 1, borderColor: "#D4E9CC" },
  promoIcon: { width: 41, height: 43, borderRadius: 13, backgroundColor: "#F7FFF2", alignItems: "center", justifyContent: "center" },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  promoTitle: { flex: 1, color: "#386A35", fontWeight: "800", fontSize: 12, lineHeight: 17 },
  promoSubtitle: { color: "#728864", fontSize: 10, lineHeight: 14, marginTop: 4 },
  progress: { height: 4, backgroundColor: "#D3E7C9", borderRadius: 3, marginTop: 10, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: "#499653" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  itemBorder: { borderTopWidth: 1, borderTopColor: "#F0F3EC", paddingTop: 15 },
  itemInfo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  itemImage: { width: 54, height: 62, borderRadius: 11, backgroundColor: "#F8FAF5", padding: 4 },
  itemPhoto: { width: "100%", height: "100%", borderRadius: 8 },
  itemEmoji: { fontSize: 30 },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 12, fontWeight: "700", color: "#41543C", lineHeight: 17 },
  itemQuantity: { color: "#78856E", fontSize: 10, marginTop: 4 },
  itemPrices: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5, marginTop: 6 },
  mrp: { color: "#B0B7A6", textDecorationLine: "line-through", fontSize: 9 },
  stepper: { width: 79, height: 32, borderRadius: 9, backgroundColor: "#28834A", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepButton: { width: 27, height: 32, alignItems: "center", justifyContent: "center" },
  stepText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  price: { color: "#304834", fontWeight: "800", fontSize: 13 },
  couponRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  coupon: { flex: 1, minWidth: 115, backgroundColor: "#EDF8E7", borderRadius: 13, padding: 12, borderWidth: 1, borderColor: "#E0EED7" },
  couponWarm: { backgroundColor: "#FFF5E3", borderColor: "#F3E5CF" },
  couponActive: { borderColor: "#5B9A65", borderWidth: 1.5 },
  couponTop: { flexDirection: "row", alignItems: "center", gap: 5 },
  couponFlat: { color: "#8B9A7E", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  couponDiscount: { color: "#3D753C", fontSize: 24, fontWeight: "900", marginTop: 7, letterSpacing: -0.6 },
  couponDiscountWarm: { color: "#A76A31" },
  couponDetail: { color: "#7C806B", fontSize: 9, marginTop: 5 },
  couponBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4, marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#DCE8D5", borderStyle: "dashed" },
  couponCode: { color: "#5E7A51", fontWeight: "800", fontSize: 11, letterSpacing: 0.4 },
  couponAction: { marginTop: 6, color: "#7B896D", fontSize: 8 },
  appliedCoupon: { borderRadius: 9, padding: 9, backgroundColor: "#F2F8EC", flexDirection: "row", alignItems: "center", gap: 6 },
  appliedCouponText: { color: "#729168", fontSize: 9, lineHeight: 14, flex: 1 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paymentIcon: { width: 37, height: 40, borderRadius: 11, backgroundColor: "#EFF4F7", alignItems: "center", justifyContent: "center" },
  walletRow: { minHeight: 61, borderRadius: 12, borderWidth: 1, borderColor: "#E5EDD9", backgroundColor: "#F9FBF5", flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 11, paddingVertical: 10 },
  walletRowDisabled: { opacity: 0.5 },
  walletTitle: { color: "#687E5B", fontSize: 11, fontWeight: "700" },
  walletSubtitle: { color: "#7E8B70", fontSize: 9, lineHeight: 13, marginTop: 4 },
  walletDeduction: { color: "#498056", fontSize: 11, fontWeight: "700" },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: "#CFDDC2", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  checkboxActive: { backgroundColor: "#28834A", borderColor: "#28834A" },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  billLabel: { color: "#78866D", fontSize: 11 },
  billValue: { color: "#728169", fontWeight: "600", fontSize: 11 },
  positive: { color: "#3C8A4B" },
  totalLine: { borderTopWidth: 1, borderTopColor: "#E7EDDF", paddingTop: 13, marginTop: 2, flexDirection: "row", justifyContent: "space-between" },
  totalText: { fontSize: 17, fontWeight: "800", color: "#324E35" },
  savingsBanner: { backgroundColor: "#F1F8EA", padding: 9, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  savingsText: { flex: 1, color: "#7C9D6F", fontSize: 9 },
  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 6 },
  footerText: { color: "#ADB6A2", fontSize: 11 },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E7EDE0", flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  payUsing: { minWidth: 83, paddingVertical: 8 },
  payCaption: { flexDirection: "row", alignItems: "center", gap: 5 },
  paySmall: { color: "#A1AD92", fontSize: 8, letterSpacing: 0.8, fontWeight: "700" },
  payMethod: { color: "#526F46", fontWeight: "800", marginTop: 5, fontSize: 13 },
  placeOrder: { flex: 1, minHeight: 54, borderRadius: 13, backgroundColor: "#28834A", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 13, gap: 8 },
  placeOrderDisabled: { opacity: 0.6 },
  payable: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  payableLabel: { color: "#C6DFC8", fontSize: 7, letterSpacing: 0.7, fontWeight: "700", marginTop: 2 },
  placeOrderCopy: { flexDirection: "row", alignItems: "center", gap: 7 },
  placeOrderText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(21,35,22,0.5)", justifyContent: "flex-end", paddingTop: 48 },
  paymentSheetWrap: { flexShrink: 1, maxHeight: "90%" },
  paymentSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 18, paddingTop: 34, gap: 12 },
  sheetClose: { position: "absolute", top: -23, alignSelf: "center", width: 46, height: 46, borderRadius: 23, borderWidth: 4, borderColor: "#FFFFFF", backgroundColor: "#203B2A", alignItems: "center", justifyContent: "center", zIndex: 10, elevation: 8 },
  sheetTitle: { fontSize: 19, color: "#304834", fontWeight: "800", letterSpacing: -0.4 },
  sheetSubtitle: { fontSize: 11, color: "#7C896F", marginTop: -6, marginBottom: 5 },
  sheetOption: { minHeight: 67, borderRadius: 13, borderWidth: 1, borderColor: "#E7EDDE", flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 12, backgroundColor: "#FAFCF7" },
  sheetOptionActive: { borderColor: "#6EA578", backgroundColor: "#EFF7E9" },
  sheetIcon: { width: 37, height: 38, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  sheetMethod: { color: "#527448", fontWeight: "800", fontSize: 12 },
  sheetHint: { color: "#79896D", fontSize: 10, marginTop: 4 },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: "#C8D6BA", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: "#4C8F56" },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#4C8F56" }
});
