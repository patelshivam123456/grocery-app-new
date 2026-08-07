import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import EmptyState from "../../components/EmptyState";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { addToCart, decrementCart, removeFromCart } from "../../store/slices/cartSlice";
import { selectCartLines, selectCartTotals, selectSelectedAddress } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function CartScreen({ navigation }) {
  const lines = useSelector(selectCartLines);
  const totals = useSelector(selectCartTotals);
  const address = useSelector(selectSelectedAddress);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const goCheckout = () => {
    const state = navigation.getState();
    if (state?.routeNames?.includes("Checkout")) {
      navigation.navigate("Checkout");
      return;
    }
    navigation.getParent()?.navigate("Home", { screen: "Checkout" });
  };
  const proceed = () => {
    if (isLoggedIn) {
      goCheckout();
      return;
    }
    setLoginOpen(true);
  };
  const continueToCheckout = () => goCheckout();

  if (!lines.length) return <EmptyState title="Your cart is empty" subtitle="Add fresh groceries and checkout in a blink." action="Start shopping" onPress={() => navigation.navigate("HomeFeed")} />;
  return (
    <View style={styles.root}>
      <Screen contentStyle={{ paddingBottom: 98 }}>
      {lines.map(({ cartKey, product, productId, unit, qty, lineTotal }) => (
        <Pressable key={cartKey} onPress={() => navigation.navigate("ProductDetails", { productId })} style={styles.line}>
          <View style={styles.itemInfo}>
            <View style={styles.iconWrap}>
              <SafeRemoteImage uri={product.imageGallery?.[0]} style={styles.photo} fallback={product.image} fallbackStyle={styles.icon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.sub}>{product.quantity} • ₹{lineTotal}</Text>
              <Pressable onPress={() => dispatch(removeFromCart(cartKey))}><Text style={styles.remove}>Remove</Text></Pressable>
            </View>
          </View>
          <View style={styles.stepper}>
            <Pressable onPress={() => dispatch(decrementCart(cartKey))}><Text style={styles.step}>-</Text></Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable onPress={() => dispatch(addToCart(unit ? { productId, unit } : productId))}><Text style={styles.step}>+</Text></Pressable>
          </View>
        </Pressable>
      ))}
      <View style={styles.bill}>
        <Text style={styles.heading}>Bill summary</Text>
        <Row label="Item total" value={`₹${totals.subtotal}`} />
        <Row label="Delivery charges" value={totals.delivery ? `₹${totals.delivery}` : "FREE"} />
        <Row label="Platform fee" value={`₹${totals.platform}`} />
        <Row label="Coupon discount" value={`-₹${totals.discount}`} />
        <Row label="Grand total" value={`₹${totals.total}`} strong />
      </View>
      <Pressable onPress={() => navigation.navigate("Addresses")} style={styles.address}>
        <Text style={styles.heading}>Deliver to</Text>
        <Text style={styles.sub}>{address ? `${address.label}: ${address.line1}` : "Select delivery address"}</Text>
      </Pressable>
      </Screen>
      <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <AppButton title="Proceed to Checkout" onPress={proceed} style={styles.checkoutButton} />
      </View>
      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={continueToCheckout} />
    </View>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.sub, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.sub, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  line: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.faint },
  itemInfo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 30 },
  photo: { width: "100%", height: "100%", borderRadius: 8 },
  name: { fontWeight: "900", color: colors.text, fontSize: type.heading },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  remove: { color: colors.danger, marginTop: 3, fontWeight: "800", fontSize: type.subheading },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, height: 34 },
  step: { color: "#fff", fontWeight: "900", fontSize: type.heading },
  qty: { color: "#fff", fontWeight: "900", fontSize: type.subheading },
  heading: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  bill: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  strong: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  address: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 4 },
  bottomAction: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.background, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.faint },
  checkoutButton: { borderRadius: 8, backgroundColor: colors.primary }
});
