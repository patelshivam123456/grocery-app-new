import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { cancelOrder } from "../../store/slices/orderSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OrderDetailsScreen({ route, navigation }) {
  const order = useSelector((state) => {
    const mobile = state.auth.mobile;
    return state.auth.isLoggedIn ? state.orders.items.find((item) => item.id === route.params.orderId && item.userMobile === mobile) : null;
  });
  const dispatch = useDispatch();
  if (!order) return null;
  const orderNumber = order.paymentResult?.payment?.orderNumber || order.paymentResult?.payment?.orderPublicId || order.paymentResult?.order?.orderNumber || order.paymentResult?.order?.orderPublicId || order.id;
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <Text style={styles.orderNumber}>Order number: {orderNumber}</Text>
        <Text style={styles.sub}>{order.status} • ₹{order.total} • {order.paymentMethod}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Items</Text>
        {order.lines.map((line, index) => (
          <Pressable key={`${line.product.id}-${index}`} onPress={() => navigation.navigate("ProductDetails", { productId: line.product.id })} style={styles.itemRow}>
            <View style={styles.itemThumb}>
              <SafeRemoteImage uri={line.product.imageGallery?.[0]} style={styles.itemPhoto} fallback={line.product.image} fallbackStyle={styles.itemEmoji} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{line.product.name}</Text>
              <Text style={styles.sub}>{line.product.quantity} x {line.qty} - ₹{line.lineTotal}</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Status timeline</Text>
        {["Placed", "Preparing", "Out for delivery", "Delivered"].map((step) => <Text key={step} style={styles.step}>● {step}</Text>)}
      </View>
      <AppButton title="Track Order" onPress={() => navigation.navigate("Tracking", { orderId: order.id })} />
      <AppButton title="Share Order Details" variant="outline" onPress={() => Share.share({ message: `Just Harvst order ${order.id}, total ₹${order.total}` })} />
      <AppButton title="Download Invoice" variant="ghost" onPress={() => {}} />
      {order.status !== "Cancelled" ? <AppButton title="Cancel Order" variant="outline" onPress={() => dispatch(cancelOrder(order.id))} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 14, gap: 8 },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  orderNumber: { color: colors.primaryDark, fontWeight: "900", fontSize: type.subheading },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  step: { color: colors.text, paddingVertical: 5, fontWeight: "700", fontSize: type.body },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  itemThumb: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#F8F9FC", alignItems: "center", justifyContent: "center" },
  itemPhoto: { width: "100%", height: "100%", borderRadius: 8 },
  itemEmoji: { fontSize: 20 },
  itemName: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  chev: { color: colors.muted, fontSize: 20 }
});
