import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import FloatingCartPill from "./FloatingCartPill";
import UnlockFreeDeliveryBottomSheet from "./UnlockFreeDeliveryBottomSheet";
import OrderStatusBottomBar from "./OrderStatusBottomBar";
import { FREE_DELIVERY_MIN, selectCartTotals } from "../store/selectors";
import { type } from "../theme/typography";
import CartPill from "./CartPill";

export const bottomStackHeight = 200;

export default function CommerceBottomStack({ navigation, showUnlock = true, onCartPress, bottomOffset = 0 }) {
  const [offersOpen, setOffersOpen] = React.useState(false);
  const count = useSelector((state) => Object.values(state.cart.items).reduce((sum, qty) => sum + qty, 0));
  const totals = useSelector(selectCartTotals);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const mobile = useSelector((state) => state.auth.mobile);
  const order = useSelector((state) => state.orders.items.find((item) => isLoggedIn && item.userMobile === mobile && item.status !== "Cancelled" && item.status !== "Delivered"));
  const hasOrder = Boolean(order);
  const hasAction = hasOrder || count > 0;
  const actionBottom = 6 + bottomOffset;
  const unlockBottom = (hasAction ? 66 : 6) + bottomOffset;
  const remaining = Math.max(FREE_DELIVERY_MIN - totals.subtotal, 0);
  const unlocked = totals.subtotal >= FREE_DELIVERY_MIN;
  const progress = Math.min(totals.subtotal / FREE_DELIVERY_MIN, 1);

  return (
    <>
      {showUnlock && count > 0 && hasOrder ? (
        <View style={[styles.actionRow, { bottom: unlockBottom }]}>
          <Pressable onPress={() => setOffersOpen(true)} style={styles.unlockBarRow}>
            <Text style={styles.unlockBadge}>Offers ^</Text>
            <Text style={styles.unlockIcon}>▣</Text>
            <View style={styles.unlockCopy}>
              <Text style={styles.unlockTitle}>{unlocked ? "Free delivery unlocked" : "Unlock free delivery"}</Text>
              <Text style={styles.unlockSub}>{unlocked ? "Delivery charge is on us" : `Shop for ₹${remaining}`}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
            </View>
          </Pressable>
          <CartPill navigation={navigation} inline style={{ flex: 0.35, marginLeft: 10 }} />
        </View>
      ) : showUnlock ? <Pressable onPress={() => setOffersOpen(true)} style={[styles.unlockBar, { bottom: unlockBottom }]}>
          <Text style={styles.unlockBadge}>Offers ^</Text>
          <Text style={styles.unlockIcon}>▣</Text>
          <View style={styles.unlockCopy}>
            <Text style={styles.unlockTitle}>{unlocked ? "Free delivery unlocked" : "Unlock free delivery"}</Text>
            <Text style={styles.unlockSub}>{unlocked ? "Delivery charge is on us" : `Shop for ₹${remaining}`}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          </View>
        </Pressable> : null}
      {/* {hasOrder&&count>0 ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, gap: 10, zIndex: 30 }}>
         <View style={{width:"70%"}}> <OrderStatusBottomBar navigation={navigation} bottomOffset={bottomOffset} /></View>
          <View style={{width:"20%"}}><FloatingCartPill navigation={navigation} bottomOffset={bottomOffset} onPress={onCartPress} style={styles.cartPill} /></View>
        </View>
      )
      : */}
      {hasOrder ? (
        <View style={{ width: "70%", alignSelf: "center" }}><OrderStatusBottomBar navigation={navigation} bottomOffset={actionBottom} /></View>
      ) : count > 0 ? (
        <FloatingCartPill navigation={navigation} bottomOffset={actionBottom} onPress={onCartPress} style={styles.cartPill} />
      ) : null}
      <UnlockFreeDeliveryBottomSheet visible={offersOpen} onClose={() => setOffersOpen(false)} subtotal={totals.subtotal} />
    </>
  );
}

const styles = StyleSheet.create({
  actionRow: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 40 },
  unlockBarRow: { flex: 0.65, minHeight: 54, marginRight: 4, borderRadius: 40, backgroundColor: "rgba(32,40,51,0.78)", borderWidth: 1, borderColor: "#303A48", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
  unlockBar: { position: "absolute", left: 12, right: 12, minHeight: 54, borderRadius: 40, backgroundColor: "rgba(32,40,51,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.24)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20, zIndex: 18 },
  unlockIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#3A4655", color: "#fff", textAlign: "center", textAlignVertical: "center", fontSize: type.body },
  unlockCopy: { flex: 1, minWidth: 0 },
  unlockTitle: { color: "#fff", fontSize: type.body, fontWeight: "900" },
  unlockSub: { color: "#B9C3D0", fontSize: type.body, marginTop: 1 },
  progressTrack: { height: 3, borderRadius: 2, backgroundColor: "#3A4655", overflow: "hidden", marginTop: 5 },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: "#24C55E" },
  unlockBadge: { position: "absolute", top: -12, alignSelf: "center", color: "#EF4B86", backgroundColor: "#fff", overflow: "hidden", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, fontSize: type.body, fontWeight: "900", zIndex: 2 },
  cartPill: { zIndex: 24, height: 52 }
});
