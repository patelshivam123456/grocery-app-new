import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import EmptyState from "../../components/EmptyState";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { addToCart, decrementCart, removeFromCart } from "../../store/slices/cartSlice";
import { FREE_DELIVERY_MIN, selectCartLines, selectCartTotals, selectSelectedAddress, selectWishlistProducts } from "../../store/selectors";

export default function CartScreen({ navigation }) {
  const lines = useSelector(selectCartLines);
  const totals = useSelector(selectCartTotals);
  const address = useSelector(selectSelectedAddress);
  const wishlist = useSelector(selectWishlistProducts);
  const coupon = useSelector((state) => state.cart.coupon);
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

  const goHome = () => navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
  const goWishlist = () => navigation.getParent()?.getParent()?.navigate("Wishlist");
  const goOffers = () => navigation.getParent()?.getParent()?.navigate("Offers");
  const goAddresses = () => navigation.getParent()?.getParent()?.navigate("Addresses");
  const remaining = Math.max(FREE_DELIVERY_MIN - totals.subtotal, 0);
  const itemSavings = lines.reduce((sum, { product, qty }) => sum + Math.max((Number(product.mrp) || 0) - (Number(product.price) || 0), 0) * qty, 0);
  const savings = itemSavings + totals.discount;

  return (
    <View style={styles.root}>
      <Screen style={styles.screen} contentStyle={[styles.content, { paddingBottom: lines.length ? 104 + insets.bottom : 28 }]}>
        {lines.length > 0 ? <>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeading}>
              <View style={styles.deliveryIcon}><Feather name="clock" size={23} color="#237344" /></View>
              <View style={styles.deliveryCopy}><Text style={styles.deliveryTitle}>Delivery in 8–15 minutes</Text><Text style={styles.deliverySubtitle}>{totals.count} {totals.count === 1 ? "item" : "items"} in your fresh little basket</Text></View>
            </View>
            <View style={styles.deliveryNote}><Feather name="truck" size={14} color="#237344" /><Text style={styles.deliveryNoteText}>{remaining ? `Add ₹${remaining} more for free delivery` : "Free delivery unlocked on this order"}</Text></View>
          </View>
          <View style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Your basket</Text>
            {lines.map(({ cartKey, product, productId, unit, qty, lineTotal }, index) => (
              <View key={cartKey} style={[styles.line, index > 0 && styles.lineDivider]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name}`} onPress={() => navigation.navigate("ProductDetails", { productId })} style={styles.itemInfo}>
                  <View style={styles.imageWrap}><SafeRemoteImage uri={product.imageGallery?.[0] || product.image} style={styles.photo} resizeMode="contain" fallback={product.image} fallbackStyle={styles.emoji} /></View>
                  <View style={styles.itemCopy}><Text numberOfLines={2} style={styles.name}>{product.name}</Text><Text style={styles.quantity}>{product.quantity}</Text><View style={styles.itemPriceRow}><Text style={styles.itemPrice}>₹{lineTotal}</Text>{product.mrp > product.price ? <Text style={styles.mrp}>₹{product.mrp * qty}</Text> : null}</View></View>
                </Pressable>
                <View style={styles.itemActions}>
                  <View style={styles.stepper}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${product.name} quantity`} onPress={() => dispatch(decrementCart(cartKey))} style={styles.stepButton}><Feather name="minus" size={14} color="#FFFFFF" /></Pressable>
                    <Text style={styles.qty}>{qty}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${product.name} quantity`} onPress={() => dispatch(addToCart(unit ? { productId, unit } : productId))} style={styles.stepButton}><Feather name="plus" size={14} color="#FFFFFF" /></Pressable>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${product.name} from cart`} onPress={() => dispatch(removeFromCart(cartKey))} hitSlop={8} style={styles.removeButton}><Text style={styles.removeText}>Remove</Text></Pressable>
                </View>
              </View>
            ))}
          </View>
        </> : null}

        <Pressable accessibilityRole="button" accessibilityLabel={`Open wishlist, ${wishlist.length} saved products`} onPress={goWishlist} style={styles.wishlistCard}>
          <View style={styles.wishlistIcon}><Feather name="heart" size={22} color="#A14365" /></View>
          <View style={styles.wishlistCopy}><View style={styles.wishlistHeading}><Text style={styles.wishlistTitle}>Your wishlist</Text><View style={styles.wishlistBadge}><Text style={styles.wishlistCount}>{wishlist.length}</Text></View></View><Text style={styles.wishlistSub}>{wishlist.length ? "Forgot a favourite? Add it to your basket." : "Save your favourites for your next basket"}</Text></View>
          <Feather name="arrow-right" size={19} color="#A14365" />
        </Pressable>

        {!lines.length ? <EmptyState title="Your cart is empty" subtitle="Your next fresh find is just a tap away." action="Start shopping" onPress={goHome} /> : <>
          <Pressable accessibilityRole="button" accessibilityLabel="View coupons and offers" onPress={goOffers} style={styles.couponCard}><View style={styles.couponIcon}><Feather name="percent" size={20} color="#71519C" /></View><View style={styles.deliveryCopy}><Text style={styles.couponTitle}>{totals.discount > 0 && coupon ? `${coupon.title} applied` : "Coupons & offers"}</Text><Text style={styles.couponSub}>{totals.discount > 0 ? `You're saving ₹${totals.discount} with this coupon` : "Find a little extra savings for your basket"}</Text></View><Feather name="chevron-right" size={19} color="#71519C" /></Pressable>
          <View style={styles.bill}>
            <View style={styles.billHeading}><Feather name="file-text" size={18} color="#344C39" /><Text style={styles.sectionTitle}>Bill details</Text></View>
            <Row label="Item total" value={`₹${totals.subtotal}`} />
            <Row label="Delivery charges" value={totals.delivery ? `₹${totals.delivery}` : "FREE"} positive={!totals.delivery} />
            <Row label="Platform fee" value={`₹${totals.platform}`} />
            {totals.discount > 0 ? <Row label="Coupon discount" value={`−₹${totals.discount}`} positive /> : null}
            <View style={styles.billDivider} /><Row label="To pay" value={`₹${totals.total}`} strong />
            {savings > 0 ? <View style={styles.savingsBanner}><Feather name="smile" size={15} color="#237344" /><Text style={styles.savingsText}>You're saving ₹{savings} on this order</Text></View> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Change delivery address" onPress={goAddresses} style={styles.addressCard}><View style={styles.addressIcon}><Feather name="map-pin" size={22} color="#237344" /></View><View style={styles.addressCopy}><Text style={styles.addressTitle}>{address ? `Deliver to ${address.label}` : "Choose a delivery address"}</Text><Text numberOfLines={2} style={styles.addressSub}>{address?.line1 || "Select where your groceries should arrive"}</Text></View><Feather name="chevron-right" size={18} color="#758572" /></Pressable>
        </>}
      </Screen>
      {lines.length > 0 ? <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 12) }]}><Pressable accessibilityRole="button" accessibilityLabel={`Proceed to checkout, total ₹${totals.total}`} onPress={proceed} style={styles.checkoutButton}><View><Text style={styles.checkoutTotal}>₹{totals.total}</Text><Text style={styles.checkoutTotalLabel}>TOTAL</Text></View><View style={styles.checkoutLabel}><Text style={styles.checkoutText}>Proceed to checkout</Text><Feather name="arrow-right" size={19} color="#FFFFFF" /></View></Pressable></View> : null}
      <LoginOtpSheet visible={loginOpen && lines.length > 0} onClose={() => setLoginOpen(false)} onSuccess={continueToCheckout} />
    </View>
  );
}

function Row({ label, value, strong, positive }) {
  return <View style={styles.billRow}><Text style={[styles.billLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.billValue, strong && styles.strong, positive && styles.positive]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6F2" },
  screen: { backgroundColor: "#F4F6F2" },
  content: { padding: 14, gap: 14 },
  deliveryCard: { backgroundColor: "#FFFFFF", borderRadius: 19, overflow: "hidden", borderWidth: 1, borderColor: "#E7ECE2" },
  deliveryHeading: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  deliveryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EAF5E6", alignItems: "center", justifyContent: "center" },
  deliveryCopy: { flex: 1 },
  deliveryTitle: { color: "#253B2B", fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  deliverySubtitle: { color: "#929B8D", fontSize: 11, marginTop: 5 },
  deliveryNote: { backgroundColor: "#ECF7E8", paddingVertical: 10, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8 },
  deliveryNoteText: { color: "#397745", fontSize: 11, fontWeight: "600", flex: 1 },
  itemsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 14, paddingTop: 16, paddingBottom: 3 },
  sectionTitle: { color: "#2A392D", fontSize: 16, fontWeight: "800" },
  line: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16 },
  lineDivider: { borderTopWidth: 1, borderTopColor: "#F0F2EC" },
  itemInfo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  imageWrap: { width: 58, height: 66, borderRadius: 12, backgroundColor: "#F8FAF5", padding: 4 },
  photo: { width: "100%", height: "100%", borderRadius: 9 },
  emoji: { fontSize: 30 },
  itemCopy: { flex: 1, minWidth: 0 },
  name: { color: "#2D3C30", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  quantity: { color: "#929B8C", fontSize: 10, marginTop: 4 },
  itemPriceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 7 },
  itemPrice: { color: "#2A392D", fontSize: 13, fontWeight: "800" },
  mrp: { color: "#A0A79A", fontSize: 9, textDecorationLine: "line-through" },
  itemActions: { alignItems: "center", gap: 9 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: 83, height: 33, backgroundColor: "#238349", borderRadius: 9 },
  stepButton: { width: 28, height: 33, alignItems: "center", justifyContent: "center" },
  qty: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  removeButton: { paddingVertical: 3 },
  removeText: { color: "#9B8279", fontSize: 9, fontWeight: "600" },
  wishlistCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF1F4", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F4E0E5" },
  wishlistIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  wishlistCopy: { flex: 1 },
  wishlistHeading: { flexDirection: "row", alignItems: "center", gap: 7 },
  wishlistTitle: { color: "#70394E", fontSize: 13, fontWeight: "800" },
  wishlistBadge: { minWidth: 22, height: 20, borderRadius: 10, backgroundColor: "#F7DCE5", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  wishlistCount: { color: "#A14365", fontSize: 10, fontWeight: "800" },
  wishlistSub: { color: "#AB8490", fontSize: 10, marginTop: 5, lineHeight: 14 },
  couponCard: { backgroundColor: "#F2EEFA", borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  couponIcon: { width: 35, height: 35, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  couponTitle: { color: "#665083", fontSize: 12, fontWeight: "800" },
  couponSub: { color: "#A092B0", fontSize: 10, marginTop: 4, lineHeight: 14 },
  bill: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, gap: 13 },
  billHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  billLabel: { color: "#889080", fontSize: 11 },
  billValue: { color: "#55614F", fontSize: 11, fontWeight: "600" },
  billDivider: { borderTopWidth: 1, borderTopColor: "#E8EDE3", borderStyle: "dashed" },
  strong: { color: "#273E2D", fontWeight: "800", fontSize: 15 },
  positive: { color: "#258549", fontWeight: "700" },
  savingsBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#EFF8EA", borderRadius: 9, padding: 10 },
  savingsText: { color: "#397745", fontSize: 10, fontWeight: "600", flex: 1 },
  addressCard: { backgroundColor: "#FFFFFF", borderRadius: 17, padding: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  addressIcon: { width: 36, height: 40, justifyContent: "center", alignItems: "center" },
  addressCopy: { flex: 1 },
  addressTitle: { color: "#304A35", fontSize: 12, fontWeight: "800" },
  addressSub: { color: "#929A8D", fontSize: 10, lineHeight: 15, marginTop: 5 },
  bottomAction: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E7ECE2" },
  checkoutButton: { minHeight: 55, borderRadius: 14, backgroundColor: "#238349", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, gap: 10 },
  checkoutTotal: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  checkoutTotalLabel: { color: "#C1E2CA", fontSize: 8, fontWeight: "700", letterSpacing: 1, marginTop: 2 },
  checkoutLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkoutText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }
});
