import React from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector, useStore } from "react-redux";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { cancelOrder } from "../../store/slices/orderSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { showToast } from "../../store/slices/appSlice";
import { formatOrderDate, orderStatus } from "../../services/orderHistory";
import { canCancelOrder, orderBill, orderProgress } from "../../services/orderDetails";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function OrderDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const order = useSelector((state) => state.auth.isLoggedIn ? state.orders.items.find((item) => item.id === route.params?.orderId && item.userMobile === state.auth.mobile) : null);
  const dispatch = useDispatch();
  const store = useStore();
  const goBack = () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("OrdersHome");
  const openHelp = () => navigation.getParent()?.getParent()?.navigate("Support", { orderId: order?.id });

  if (!order) return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}><Feather name="arrow-left" size={22} color="#173D30" /></Pressable><Text style={styles.headerTitle}>Order details</Text></View>
      <View style={styles.empty}><Feather name="package" size={36} color="#0D7163" /><Text style={styles.sectionTitle}>Order unavailable</Text><Text style={styles.body}>This order isn't available for your account.</Text><Pressable accessibilityRole="button" onPress={goBack} style={styles.emptyButton}><Text style={styles.primaryText}>Back to orders</Text></Pressable></View>
    </SafeAreaView>
  );

  const status = orderStatus(order.status);
  const progress = orderProgress(order.status);
  const bill = orderBill(order);
  const lines = (order.lines || []).filter((line) => line.product?.id);
  const itemCount = lines.reduce((sum, line) => sum + (Number(line.qty) || 1), 0);
  const orderNumber = order.paymentResult?.payment?.orderNumber || order.paymentResult?.payment?.orderPublicId || order.paymentResult?.order?.orderNumber || order.paymentResult?.order?.orderPublicId || order.id;
  const address = order.address;
  const walletAmount = Number(order.walletAmount) || 0;
  const payment = order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod || "Not recorded";
  const statusCopy = status.group === "delivered" ? (order.deliveredAt ? `Delivered on ${formatOrderDate(order.deliveredAt)}` : "Your groceries have been delivered.") : status.group === "cancelled" ? "This order was cancelled." : status.group === "failed" ? "This order could not be completed." : order.status === "Preparing" ? "Your groceries are being prepared." : "Check tracking for the latest update.";
  const shareOrder = () => Share.share({ message: `Just Harvst order #${orderNumber}\n${status.label}\nPlaced: ${formatOrderDate(order.createdAt)}\n${lines.map((line) => `${line.product.name} × ${line.qty || 1}`).join("\n")}\nTotal: ${money(order.total)}` });
  const reorder = () => {
    lines.forEach((line) => {
      const payload = line.unit ? { productId: line.product.id, unit: line.unit } : line.product.id;
      for (let count = 0; count < Math.max(1, Math.floor(Number(line.qty) || 1)); count++) dispatch(addToCart(payload));
    });
    dispatch(showToast("Items added to your cart"));
    navigation.getParent()?.navigate("Home", { screen: "Cart" });
  };
  const requestCancel = () => Alert.alert("Cancel this order?", "Your order will stop being prepared.", [
    { text: "Keep order", style: "cancel" },
    { text: "Cancel order", style: "destructive", onPress: () => {
      const state = store.getState();
      const latest = state.auth.isLoggedIn && state.orders.items.find((item) => item.id === order.id && item.userMobile === state.auth.mobile);
      if (!latest || !canCancelOrder(latest.status)) { dispatch(showToast("This order can no longer be cancelled")); return; }
      dispatch(cancelOrder(order.id));
      dispatch(showToast("Order cancelled"));
    } }
  ]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}><Feather name="arrow-left" size={22} color="#173D30" /></Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>Order details</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Share order details" onPress={shareOrder} style={styles.iconButton}><Feather name="share-2" size={20} color="#0D7163" /></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        <View style={styles.summary}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIcon, { backgroundColor: status.background }]}><Feather name={status.icon} size={23} color={status.color} /></View>
            <View style={styles.flex}><Text style={[styles.statusTitle, { color: status.color }]}>{status.label}</Text><Text style={styles.statusCopy}>{statusCopy}</Text></View>
          </View>
          <View style={styles.reference}>
            <Text selectable style={styles.orderNumber}>Order #{orderNumber}</Text>
            <Text style={styles.smallText}>Placed {formatOrderDate(order.createdAt)}</Text>
          </View>
          <View style={styles.progress}>
            {progress.labels.map((label, index) => {
              const completed = index < progress.current || (status.group === "delivered" && index === progress.current);
              const current = index === progress.current;
              const color = current && progress.terminal ? status.color : "#0D7163";
              return <View key={label} style={styles.progressStep}>
                <View style={styles.progressTrack}>
                  {index > 0 ? <View style={[styles.connector, styles.connectorLeft, index <= progress.current && styles.connectorComplete]} /> : null}
                  {index < progress.labels.length - 1 ? <View style={[styles.connector, styles.connectorRight, index < progress.current && styles.connectorComplete]} /> : null}
                  <View style={[styles.progressDot, (completed || current) && { borderColor: color, backgroundColor: completed || progress.terminal ? color : "#FFFFFF" }]}>{completed ? <Feather name="check" size={11} color="#FFFFFF" /> : current && progress.terminal ? <Feather name="x" size={11} color="#FFFFFF" /> : current ? <View style={[styles.currentDot, { backgroundColor: color }]} /> : null}</View>
                </View>
                <Text style={[styles.progressLabel, (completed || current) && styles.progressLabelActive]}>{label}</Text>
              </View>;
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Your items</Text><Text style={styles.smallText}>{itemCount} {itemCount === 1 ? "item" : "items"}</Text></View>
          {lines.map((line, index) => <Pressable key={`${line.product.id}-${index}`} accessibilityRole="button" accessibilityLabel={`View ${line.product.name}`} onPress={() => navigation.navigate("ProductDetails", { productId: line.product.id })} style={[styles.itemRow, index > 0 && styles.itemDivider]}>
            <View style={styles.itemThumb}><SafeRemoteImage uri={line.unit?.imageGallery?.[0] || line.product.imageGallery?.[0] || line.product.image} style={styles.itemPhoto} resizeMode="contain" fallback="🛍️" fallbackStyle={styles.itemFallback} /></View>
            <View style={styles.itemCopy}><Text numberOfLines={2} style={styles.itemName}>{line.product.name}</Text><Text style={styles.smallText}>{line.unit?.label || line.product.quantity} · Qty {line.qty || 1}</Text></View>
            <Text style={styles.itemPrice}>{line.lineTotal != null ? money(line.lineTotal) : ""}</Text><Feather name="chevron-right" size={15} color="#A1ADA4" />
          </Pressable>)}
          {!lines.length ? <Text style={styles.body}>Item details aren't available for this order.</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Delivery details</Text><Feather name="map-pin" size={17} color="#7C9283" /></View>
          {address ? <View style={styles.addressRow}><View style={styles.addressIcon}><Feather name={String(address.label).toLowerCase() === "home" ? "home" : "map-pin"} size={18} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.addressLabel}>{address.label || "Delivery address"}</Text><Text style={styles.addressText}>{[address.line1, address.line2, address.city, address.pincode].filter(Boolean).join(", ")}</Text></View></View> : <Text style={styles.body}>No delivery address was saved with this order.</Text>}
          {order.instruction ? <View style={styles.instruction}><Feather name="message-square" size={14} color="#788D7F" /><Text style={styles.instructionText}>{order.instruction}</Text></View> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Bill summary</Text><Feather name="file-text" size={17} color="#7C9283" /></View>
          {bill.subtotal != null ? <BillRow label="Items total" value={money(bill.subtotal)} /> : null}
          {bill.adjustment != null && bill.adjustment !== 0 ? <BillRow label={bill.adjustment < 0 ? "Discounts & adjustments" : "Fees & adjustments"} value={`${bill.adjustment < 0 ? "−" : ""}${money(Math.abs(bill.adjustment))}`} /> : null}
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Order total</Text><Text style={styles.totalPrice}>{money(bill.total)}</Text></View>
          <View style={styles.paymentRow}><View style={styles.paymentIcon}><Feather name={order.paymentMethod === "COD" ? "dollar-sign" : order.paymentMethod === "Wallet" ? "credit-card" : "smartphone"} size={17} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.paymentLabel}>Payment method</Text><Text style={styles.paymentValue}>{payment}{walletAmount > 0 && order.paymentMethod !== "Wallet" ? " + Wallet" : ""}</Text></View></View>
          {walletAmount > 0 ? <BillRow label="Wallet contribution" value={money(walletAmount)} /> : null}
        </View>

        <View style={styles.section}>
          <Pressable accessibilityRole="button" onPress={openHelp} style={styles.helpRow}><View style={styles.helpIcon}><Feather name="message-circle" size={20} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.helpTitle}>Need help with this order?</Text><Text style={styles.smallText}>Visit our help centre</Text></View><Feather name="chevron-right" size={18} color="#0D7163" /></Pressable>
          {canCancelOrder(order.status) ? <Pressable accessibilityRole="button" onPress={requestCancel} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel order</Text></Pressable> : null}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.flex}><Text style={styles.smallText}>Order total</Text><Text style={styles.footerPrice}>{money(order.total)}</Text></View>
        <Pressable accessibilityRole="button" disabled={status.group !== "ongoing" && !lines.length} onPress={() => status.group === "ongoing" ? navigation.navigate("Tracking", { orderId: order.id }) : reorder()} style={[styles.primaryButton, status.group !== "ongoing" && !lines.length && styles.disabled]}><Feather name={status.group === "ongoing" ? "map-pin" : "rotate-ccw"} size={17} color="#FFFFFF" /><Text style={styles.primaryText}>{status.group === "ongoing" ? "Track order" : "Buy again"}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

function BillRow({ label, value }) {
  return <View style={styles.billRow}><Text style={styles.billLabel}>{label}</Text><Text style={styles.billValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#EEF2EE" },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#243B2D", fontSize: 18, fontWeight: "700" },
  flex: { flex: 1, minWidth: 0 },
  content: { backgroundColor: "#F5F7F5", gap: 8 },
  summary: { padding: 18, paddingBottom: 16, backgroundColor: "#FFFFFF", gap: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  statusCopy: { color: "#7A8C7F", fontSize: 11, lineHeight: 17, marginTop: 4 },
  reference: { gap: 5 },
  orderNumber: { color: "#415C49", fontSize: 12, fontWeight: "600" },
  smallText: { color: "#87958B", fontSize: 11, lineHeight: 16 },
  progress: { flexDirection: "row", paddingTop: 2 },
  progressStep: { flex: 1, alignItems: "center", gap: 7 },
  progressTrack: { width: "100%", height: 22, alignItems: "center", justifyContent: "center" },
  connector: { position: "absolute", top: 10, height: 2, width: "50%", backgroundColor: "#E6ECE7" },
  connectorLeft: { left: 0 },
  connectorRight: { right: 0 },
  connectorComplete: { backgroundColor: "#0D7163" },
  progressDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#E3EAE4", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  currentDot: { width: 6, height: 6, borderRadius: 3 },
  progressLabel: { color: "#A0ABA3", fontSize: 10, textAlign: "center" },
  progressLabelActive: { color: "#45664F", fontWeight: "600" },
  section: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { color: "#2B4232", fontSize: 15, fontWeight: "700" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 68 },
  itemDivider: { borderTopWidth: 1, borderTopColor: "#F0F3F0", paddingTop: 10 },
  itemThumb: { width: 52, height: 58, borderRadius: 10, padding: 5, backgroundColor: "#F7FAF7", borderWidth: 1, borderColor: "#EBF0EA", alignItems: "center", justifyContent: "center" },
  itemPhoto: { width: "100%", height: "100%", borderRadius: 6 },
  itemFallback: { fontSize: 26 },
  itemCopy: { flex: 1, minWidth: 0, gap: 6 },
  itemName: { color: "#3E5545", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  itemPrice: { color: "#2F4937", fontSize: 13, fontWeight: "700" },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  addressIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#EDF6F0" },
  addressLabel: { color: "#3A5542", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  addressText: { color: "#7A8B7F", fontSize: 12, lineHeight: 19 },
  instruction: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10, backgroundColor: "#F6F9F6" },
  instructionText: { flex: 1, color: "#718678", fontSize: 11, lineHeight: 17 },
  billRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  billLabel: { flex: 1, color: "#7F8F83", fontSize: 12 },
  billValue: { color: "#4A6252", fontSize: 12 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#EAF0EA", paddingTop: 13 },
  totalLabel: { color: "#2C4834", fontSize: 14, fontWeight: "700" },
  totalPrice: { color: "#1F4230", fontSize: 18, fontWeight: "800" },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: "#F5F9F6", borderRadius: 12 },
  paymentIcon: { width: 30, alignItems: "center", justifyContent: "center" },
  paymentLabel: { color: "#88988C", fontSize: 10, marginBottom: 4 },
  paymentValue: { color: "#46644F", fontSize: 12, fontWeight: "600" },
  helpRow: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 10 },
  helpIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#EDF6F0", alignItems: "center", justifyContent: "center" },
  helpTitle: { color: "#3E5C47", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  cancelButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: "#F0F3F0", paddingTop: 10 },
  cancelText: { color: "#AD5C5C", fontSize: 12, fontWeight: "600" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 18, paddingTop: 12, minHeight: 80, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E3EBE4" },
  footerPrice: { color: "#254431", fontSize: 22, fontWeight: "800", marginTop: 3 },
  primaryButton: { minHeight: 46, minWidth: 150, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 11, backgroundColor: "#0D7163" },
  primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  body: { color: "#819186", fontSize: 12, lineHeight: 19, textAlign: "center" },
  empty: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 16 },
  emptyButton: { minHeight: 44, paddingHorizontal: 22, borderRadius: 10, backgroundColor: "#0D7163", alignItems: "center", justifyContent: "center" }
});
