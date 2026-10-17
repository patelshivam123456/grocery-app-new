import React from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import { addToCart } from "../../store/slices/cartSlice";
import { showToast } from "../../store/slices/appSlice";
import { selectCartTotals, selectUserOrders } from "../../store/selectors";
import { filterOrderHistory, formatOrderDate, orderStatus } from "../../services/orderHistory";

const filters = [
  { id: "all", label: "All orders" },
  { id: "ongoing", label: "Ongoing" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" }
];

export default function OrdersScreen({ navigation }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const orders = useSelector(selectUserOrders);
  const totals = useSelector(selectCartTotals);
  const dispatch = useDispatch();
  const listRef = React.useRef(null);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [loginOpen, setLoginOpen] = React.useState(false);
  const visibleOrders = React.useMemo(() => filterOrderHistory(orders, query, filter), [orders, query, filter]);
  const goHome = () => navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
  const goBack = () => navigation.canGoBack() ? navigation.goBack() : goHome();
  const clearFilters = () => { setQuery(""); setFilter("all"); };
  const reorder = (order) => {
    (order.lines || []).forEach((line) => {
      if (line.product?.id) dispatch(addToCart(line.unit ? { productId: line.product.id, unit: line.unit } : line.product.id));
    });
    dispatch(showToast("Items added to your cart"));
  };
  const emptyTitle = !isLoggedIn ? "Your orders, all in one place" : !orders.length ? "Your first basket awaits" : "No matching orders";
  const emptyCopy = !isLoggedIn ? "Log in to view your past orders and keep track of new deliveries." : !orders.length ? "Once you place an order, you can track it and shop your favourites again here." : "Try a different product name, order ID or status.";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.headerButton}><Feather name="arrow-left" size={22} color="#173D30" /></Pressable>
        <Text accessibilityRole="header" style={styles.title}>Order history</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`View cart, ${totals.count} items`} onPress={() => navigation.getParent()?.navigate("Home", { screen: "Cart" })} style={styles.cartButton}>
          <Feather name="shopping-bag" size={20} color="#0D7163" />
          {totals.count > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totals.count > 99 ? "99+" : totals.count}</Text></View> : null}
        </Pressable>
      </View>
      {isLoggedIn && orders.length > 0 ? <View style={styles.controls}>
        <View style={styles.search}>
          <Feather name="search" size={18} color="#748278" />
          <TextInput accessibilityLabel="Search orders by product name or order ID" value={query} onChangeText={(value) => { setQuery(value); listRef.current?.scrollToOffset({ offset: 0, animated: false }); }} placeholder="Search by item or order ID" placeholderTextColor="#8A958D" style={styles.searchInput} autoCorrect={false} returnKeyType="search" />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear order search" hitSlop={6} onPress={() => setQuery("")} style={styles.clearSearch}><Feather name="x" size={16} color="#718277" /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: filter === item.id }} onPress={() => { setFilter(item.id); listRef.current?.scrollToOffset({ offset: 0, animated: false }); }} style={[styles.filterChip, filter === item.id && styles.filterChipActive]}><Text style={[styles.filterLabel, filter === item.id && styles.filterLabelActive]}>{item.label}</Text></Pressable>)}
        </ScrollView>
      </View> : null}
      <FlatList
        ref={listRef}
        data={visibleOrders}
        keyExtractor={(order) => String(order.id)}
        contentContainerStyle={[styles.content, !visibleOrders.length && styles.emptyContent]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={visibleOrders.length ? <View style={styles.listHeading}><Text accessibilityLiveRegion="polite" style={styles.orderCount}>{visibleOrders.length} {visibleOrders.length === 1 ? "order" : "orders"}</Text><Text style={styles.listHint}>Most recent first</Text></View> : null}
        renderItem={({ item }) => <OrderCard order={item} navigation={navigation} onReorder={reorder} />}
        ListEmptyComponent={<View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Feather name={!isLoggedIn ? "lock" : !orders.length ? "shopping-bag" : "search"} size={32} color="#0D7163" /></View>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyCopy}>{emptyCopy}</Text>
          <Pressable accessibilityRole="button" onPress={() => !isLoggedIn ? setLoginOpen(true) : !orders.length ? goHome() : clearFilters()} style={styles.emptyButton}><Text style={styles.primaryText}>{!isLoggedIn ? "Log in" : !orders.length ? "Start shopping" : "Clear search & filters"}</Text></Pressable>
        </View>}
      />
      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} />
    </SafeAreaView>
  );
}

function OrderCard({ order, navigation, onReorder }) {
  const status = orderStatus(order.status);
  const lines = (order.lines || []).filter((line) => line.product?.id);
  const itemCount = lines.reduce((sum, line) => sum + (Number(line.qty) || 1), 0);
  const openOrder = () => navigation.navigate("OrderDetails", { orderId: order.id });
  const amount = Number(order.total || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${status.label.toLowerCase()} order ${order.id}, ₹${amount}`} onPress={openOrder} style={styles.cardTop}>
        <View style={[styles.statusIcon, { backgroundColor: status.background }]}><Feather name={status.icon} size={18} color={status.color} /></View>
        <View style={styles.statusCopy}><Text style={[styles.status, { color: status.color }]}>{status.label}</Text><Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text></View>
        <View style={styles.amountCopy}><Text style={styles.amount}>₹{amount}</Text><Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? "item" : "items"}</Text></View>
      </Pressable>
      <View style={styles.orderBody}>
        <View style={styles.thumbnails}>
          {lines.slice(0, 2).map((line, index) => <Pressable key={`${line.product.id}-${index}`} accessibilityRole="button" accessibilityLabel={`View ${line.product.name}`} onPress={() => navigation.navigate("ProductDetails", { productId: line.product.id })} style={styles.productThumb}>
            <SafeRemoteImage uri={line.unit?.imageGallery?.[0] || line.product.imageGallery?.[0] || line.product.image} style={styles.productPhoto} resizeMode="contain" fallback="🛍️" fallbackStyle={styles.productFallback} />
          </Pressable>)}
          {lines.length > 2 ? <View style={styles.moreThumb}><Text style={styles.moreText}>+{lines.length - 2}</Text></View> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="View order items" onPress={openOrder} style={styles.itemSummary}><Text numberOfLines={2} style={styles.itemNames}>{lines.length ? lines.map((line) => line.product.name).join(", ") : "View order items"}</Text><Text numberOfLines={1} style={styles.orderId}>Order #{order.id}</Text></Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={openOrder} style={styles.secondaryButton}><Text style={styles.secondaryText}>View order</Text><Feather name="chevron-right" size={15} color="#0D7163" /></Pressable>
        <Pressable accessibilityRole="button" disabled={status.group !== "ongoing" && !lines.length} onPress={() => status.group === "ongoing" ? navigation.navigate("Tracking", { orderId: order.id }) : onReorder(order)} style={[styles.primaryButton, status.group !== "ongoing" && !lines.length && styles.disabled]}><Feather name={status.group === "ongoing" ? "map-pin" : "rotate-ccw"} size={14} color="#FFFFFF" /><Text style={styles.primaryText}>{status.group === "ongoing" ? "Track order" : "Buy again"}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8F6" },
  header: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: "#FFFFFF" },
  headerButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: "#20382A", fontWeight: "800", fontSize: 22, letterSpacing: -0.5 },
  cartButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#F5F9F6", borderWidth: 1, borderColor: "#E3EBE5", alignItems: "center", justifyContent: "center" },
  cartBadge: { position: "absolute", top: 0, right: 0, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: "#0D7163", alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
  controls: { paddingTop: 4, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E7EEE8" },
  search: { height: 44, borderRadius: 12, backgroundColor: "#F6F8F6", borderWidth: 1, borderColor: "#E4EBE5", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginHorizontal: 16 },
  searchInput: { flex: 1, minWidth: 0, height: "100%", paddingVertical: 0, color: "#273E2F", fontSize: 13 },
  clearSearch: { width: 30, height: 32, alignItems: "center", justifyContent: "center" },
  filters: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 8 },
  filterChip: { minHeight: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: "#E0E9E2", alignItems: "center", justifyContent: "center" },
  filterChipActive: { backgroundColor: "#0D7163", borderColor: "#0D7163" },
  filterLabel: { color: "#697B6E", fontSize: 12, fontWeight: "600" },
  filterLabelActive: { color: "#FFFFFF" },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  listHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingBottom: 2 },
  orderCount: { color: "#425C4A", fontSize: 12, fontWeight: "700" },
  listHint: { color: "#8B978E", fontSize: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3EAE4", padding: 14, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  statusIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statusCopy: { flex: 1, minWidth: 0, gap: 4 },
  status: { fontWeight: "700", fontSize: 14, lineHeight: 19 },
  orderDate: { color: "#8A958D", fontSize: 10, lineHeight: 14 },
  amountCopy: { alignItems: "flex-end", gap: 4 },
  amount: { color: "#263B2D", fontSize: 16, fontWeight: "800" },
  itemCount: { color: "#869389", fontSize: 10 },
  orderBody: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0F3F0" },
  thumbnails: { flexDirection: "row", alignItems: "center", gap: 5 },
  productThumb: { width: 40, height: 44, borderRadius: 8, padding: 3, backgroundColor: "#F8FAF8", borderWidth: 1, borderColor: "#ECF0EB", alignItems: "center", justifyContent: "center" },
  productPhoto: { width: "100%", height: "100%", borderRadius: 5 },
  productFallback: { fontSize: 22 },
  moreThumb: { width: 30, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 7, backgroundColor: "#F0F5F1" },
  moreText: { color: "#668170", fontSize: 11, fontWeight: "700" },
  itemSummary: { flex: 1, minWidth: 0, gap: 5, minHeight: 44, justifyContent: "center" },
  itemNames: { color: "#4F6155", fontSize: 11, lineHeight: 16, fontWeight: "500" },
  orderId: { color: "#95A097", fontSize: 9 },
  actions: { flexDirection: "row", gap: 9, paddingTop: 2 },
  secondaryButton: { flex: 1, minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, borderWidth: 1, borderColor: "#D9E7DD", backgroundColor: "#FFFFFF" },
  secondaryText: { color: "#0D7163", fontWeight: "700", fontSize: 12 },
  primaryButton: { flex: 1, minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, backgroundColor: "#0D7163" },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  disabled: { opacity: 0.4 },
  emptyContent: { flexGrow: 1, justifyContent: "center" },
  emptyCard: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 22, gap: 12 },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, backgroundColor: "#E7F3EC", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  emptyTitle: { color: "#294432", fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyCopy: { color: "#7C8B80", fontSize: 13, lineHeight: 20, textAlign: "center" },
  emptyButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#0D7163", marginTop: 8 }
});
