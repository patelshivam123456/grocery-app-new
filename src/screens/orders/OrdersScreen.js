import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { addToCart } from "../../store/slices/cartSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OrdersScreen({ navigation }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const mobile = useSelector((state) => state.auth.mobile);
  const orders = useSelector((state) => state.orders.items.filter((order) => isLoggedIn && order.userMobile === mobile));
  const dispatch = useDispatch();
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" }));
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.title}>Order History</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.search}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Search your grocery orders</Text></View>
        {!isLoggedIn ? (
          <View style={styles.emptyCard}>
            <Text style={styles.failedIcon}>🧺</Text>
            <Text style={styles.failedTitle}>Login to view orders</Text>
            <Text style={styles.sub}>Your order history will appear here after you login and place an order.</Text>
          </View>
        ) : !orders.length ? (
          <View style={styles.emptyCard}>
            <Text style={styles.failedIcon}>🧺</Text>
            <Text style={styles.failedTitle}>No orders yet</Text>
            <Text style={styles.sub}>Orders placed from this account will show here.</Text>
          </View>
        ) : null}
        {orders.map((order) => (
          <Pressable key={order.id} onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.status}>{order.status === "Preparing" ? "Your order is on the way" : order.status}</Text>
                <Text style={styles.sub}>₹{order.total} • {new Date(order.createdAt).toLocaleString([], { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" })}</Text>
              </View>
              <Text style={styles.menu}>⋮</Text>
            </View>
            <View style={styles.products}>
              {order.lines.slice(0, 5).map((line, index) => (
                <Pressable key={`${line.product.id}-${index}`} onPress={() => navigation.navigate("ProductDetails", { productId: line.product.id })} style={styles.productThumb}>
                  <SafeRemoteImage uri={line.product.imageGallery?.[0]} style={styles.productPhoto} fallback={line.product.image} fallbackStyle={styles.productEmoji} />
                </Pressable>
              ))}
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => order.lines.forEach((line) => dispatch(addToCart(line.unit ? { productId: line.product.id, unit: line.unit } : line.product.id)))} style={styles.action}><Text style={styles.actionText}>Reorder</Text></Pressable>
              <Pressable onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })} style={styles.action}><Text style={styles.actionText}>Show order</Text></Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F5FA" },
  content: { padding: 12, gap: 12, paddingBottom: 28 },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: "#F4F5FA", borderBottomWidth: 1, borderBottomColor: colors.faint },
  back: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 20, lineHeight: 22, color: colors.text },
  title: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  search: { height: 42, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#DEE2EA", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 },
  searchIcon: { fontSize: 22 },
  searchText: { color: colors.muted, fontSize: type.subheading },
  failed: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderRadius: 8, padding: 12 },
  emptyCard: { minHeight: 150, alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.surface, borderRadius: 8, padding: 18, borderWidth: 1, borderColor: colors.faint },
  failedIcon: { fontSize: 24 },
  failedTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  viewBtn: { borderWidth: 1, borderColor: colors.primary, color: colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, overflow: "hidden", fontWeight: "900", fontSize: type.subheading },
  card: { backgroundColor: colors.surface, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: colors.faint },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  check: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  checkText: { color: colors.success, fontSize: 24, fontWeight: "900" },
  status: { color: colors.text, fontWeight: "900", fontSize: type.heading, lineHeight: 17 },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  menu: { color: colors.muted, fontSize: 22 },
  products: { flexDirection: "row", gap: 8, borderTopWidth: 1, borderTopColor: colors.faint, padding: 12 },
  productThumb: { width: 42, height: 42, borderRadius: 8, backgroundColor: "#F8F9FC", borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  productPhoto: { width: "100%", height: "100%", borderRadius: 8 },
  productEmoji: { fontSize: 23 },
  actions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.faint },
  action: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
  actionText: { color: colors.primary, fontWeight: "900", fontSize: type.subheading }
});
