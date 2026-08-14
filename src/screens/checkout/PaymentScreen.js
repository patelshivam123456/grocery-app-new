import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { completeCheckoutPayment } from "../../services/checkout.service";
import { clearCart, setPaymentMethod } from "../../store/slices/cartSlice";
import { placeOrder } from "../../store/slices/orderSlice";
import { showToast } from "../../store/slices/appSlice";
import { selectCartLines, selectCartTotals, selectSelectedAddress } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const methods = ["UPI", "Card", "COD", "Wallet"];

export default function PaymentScreen({ navigation }) {
  const method = useSelector((state) => state.cart.paymentMethod);
  const totals = useSelector(selectCartTotals);
  const lines = useSelector(selectCartLines);
  const address = useSelector(selectSelectedAddress);
  const instruction = useSelector((state) => state.cart.deliveryInstruction);
  const mobile = useSelector((state) => state.auth.mobile);
  const dispatch = useDispatch();
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const submit = async () => {
    if (placingOrder) return;
    try {
      setPlacingOrder(true);
      const paymentResult = await completeCheckoutPayment({ lines, total: totals.total, address, instruction, paymentMethod: method, userMobile: mobile });
      dispatch(placeOrder({ lines, total: totals.total, address, instruction, paymentMethod: method, userMobile: mobile, paymentResult }));
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
        <Pressable key={item} onPress={() => dispatch(setPaymentMethod(item))} style={[styles.option, method === item && styles.active]}>
          <Text style={[styles.name, method === item && styles.activeText]}>{item}</Text>
          <Text style={[styles.sub, method === item && styles.activeText]}>{item === "COD" ? "Pay when groceries arrive" : "Mock payment option"}</Text>
        </Pressable>
      ))}
      <View style={styles.card}>
        <Text style={styles.sub}>Amount to pay</Text>
        <Text style={styles.total}>₹{totals.total}</Text>
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
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 8 },
  total: { fontSize: type.heading, fontWeight: "900", color: colors.primary }
});
