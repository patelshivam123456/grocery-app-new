import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { completeCheckoutPayment } from "../../services/checkout.service";
import { clearCart, setPaymentMethod } from "../../store/slices/cartSlice";
import { placeOrder } from "../../store/slices/orderSlice";
import { showToast } from "../../store/slices/appSlice";
import { debitWalletMoney } from "../../store/slices/userSlice";
import { selectCartLines, selectCartTotals, selectSelectedAddress, selectVisibleWalletBalance } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const methods = ["UPI", "COD"];
const validMethods = [...methods, "Wallet"];

export default function PaymentScreen({ navigation }) {
  const method = useSelector((state) => state.cart.paymentMethod);
  const totals = useSelector(selectCartTotals);
  const lines = useSelector(selectCartLines);
  const address = useSelector(selectSelectedAddress);
  const instruction = useSelector((state) => state.cart.deliveryInstruction);
  const mobile = useSelector((state) => state.auth.mobile);
  const customer = useSelector((state) => state.auth.customer);
  const userName = useSelector((state) => state.user.name);
  const activeCoupon = useSelector((state) => state.cart.coupon);
  const walletBalance = useSelector(selectVisibleWalletBalance);
  const dispatch = useDispatch();
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const [walletSelected, setWalletSelected] = React.useState(method === "UPI" && walletBalance > 0);
  const walletEnabled = (method === "UPI" || method === "Wallet") && walletBalance > 0;
  const walletAmount = walletEnabled && walletSelected ? Math.min(walletBalance, totals.total) : 0;
  const payableAmount = Math.max(totals.total - walletAmount, 0);
  const walletCoversTotal = walletEnabled && walletSelected && totals.total > 0 && totals.total <= walletBalance;
  const effectiveMethod = walletCoversTotal ? "Wallet" : method === "Wallet" ? "UPI" : method;
  React.useEffect(() => {
    if (!validMethods.includes(method)) {
      dispatch(setPaymentMethod("UPI"));
      setWalletSelected(walletBalance > 0);
      return;
    }
    if (method === "COD" || walletBalance <= 0) {
      if (walletSelected) setWalletSelected(false);
      return;
    }
    if (!walletSelected && method === "Wallet") {
      dispatch(setPaymentMethod("UPI"));
      return;
    }
    if (!walletSelected) return;
    if (walletCoversTotal && method !== "Wallet") {
      dispatch(setPaymentMethod("Wallet"));
      return;
    }
    if (!walletCoversTotal && method === "Wallet") dispatch(setPaymentMethod("UPI"));
  }, [dispatch, method, walletBalance, walletCoversTotal, walletSelected]);
  const selectMethod = (item) => {
    dispatch(setPaymentMethod(item));
    setWalletSelected(item === "UPI" && walletBalance > 0);
  };
  const toggleWallet = () => {
    if (!walletEnabled) return;
    setWalletSelected((selected) => !selected);
  };
  const submit = async () => {
    if (placingOrder) return;
    try {
      setPlacingOrder(true);
      const paymentResult = await completeCheckoutPayment({ lines, total: totals.total, address, instruction, paymentMethod: effectiveMethod, userMobile: mobile, customer, userName, coupon: activeCoupon, walletAmount });
      if (walletAmount > 0) dispatch(debitWalletMoney(walletAmount));
      dispatch(placeOrder({ lines, total: totals.total, address, instruction, paymentMethod: effectiveMethod, userMobile: mobile, paymentResult, walletAmount }));
      dispatch(clearCart());
      navigation.replace("OrderSuccess", { orderNumber: paymentResult.payment?.orderNumber || paymentResult.payment?.orderPublicId || paymentResult.order?.orderNumber || paymentResult.order?.orderPublicId });
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to place order. Please try again."));
    } finally {
      setPlacingOrder(false);
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>Select payment method</Text>
      {methods.map((item) => (
        <Pressable key={item} onPress={() => selectMethod(item)} style={[styles.option, method === item && styles.active]}>
          <Text style={[styles.name, method === item && styles.activeText]}>{item}</Text>
          <Text style={[styles.sub, method === item && styles.activeText]}>{item === "COD" ? "Pay when groceries arrive" : "Pay online with Razorpay"}</Text>
        </Pressable>
      ))}
      <Pressable onPress={toggleWallet} disabled={!walletEnabled} style={[styles.walletRow, !walletEnabled && styles.walletRowDisabled]}>
        <View style={[styles.checkbox, walletSelected && walletEnabled && styles.checkboxActive]}>
          <Text style={styles.checkboxText}>{walletSelected && walletEnabled ? "✓" : ""}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, !walletEnabled && styles.disabledText]}>Use wallet balance</Text>
          <Text style={styles.sub}>{method === "COD" ? "Wallet is disabled for COD" : walletBalance > 0 ? `Available ₹${walletBalance}` : "No wallet balance available"}</Text>
        </View>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.sub}>Amount to pay</Text>
        <Text style={styles.total}>₹{payableAmount}</Text>
        <Text style={styles.sub}>Payment method: {effectiveMethod}</Text>
      </View>
      <AppButton title="Place Order" onPress={submit} loading={placingOrder} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  option: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.faint },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  name: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  sub: { color: colors.muted, marginTop: 4, fontSize: type.body },
  activeText: { color: "#fff" },
  walletRow: { minHeight: 62, backgroundColor: colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 10 },
  walletRowDisabled: { opacity: 0.58 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: colors.faint, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxText: { color: "#fff", fontWeight: "900", fontSize: type.body, lineHeight: 14 },
  disabledText: { color: colors.muted },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 8 },
  total: { fontSize: type.heading, fontWeight: "900", color: colors.primary }
});
