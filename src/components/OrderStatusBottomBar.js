import React from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function OrderStatusBottomBar({ navigation, bottomOffset }) {
  const insets = useSafeAreaInsets();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const mobile = useSelector((state) => state.auth.mobile);
  const order = useSelector((state) => state.orders.items.find((item) => isLoggedIn && item.userMobile === mobile && item.status !== "Cancelled" && item.status !== "Delivered"));

  if (!order) return null;

  return (
    <Pressable
      onPress={() => navigation.getParent()?.navigate("Orders", { screen: "Tracking", params: { orderId: order.id } })}
      style={[styles.bar, { bottom: bottomOffset == null ? 6 + insets.bottom : bottomOffset }]}
    >
      <View style={styles.icon}><Feather name="truck" size={19} color={colors.primary} /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>Your order is on the way</Text>
        <Text numberOfLines={1} style={styles.sub}>{order.lines?.length || 0} items • Track live status</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {width:"100%", position: "absolute", left: 0, right: 0, minHeight: 40, borderRadius: 40,  backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, gap: 10, shadowColor: "#073D21", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8, zIndex: 30, },
  icon: { width: 22, height: 22, borderRadius: 8, backgroundColor: "#F5FFF7", alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0 },
  title: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  sub: { color: "#DDFBE4", fontSize: type.body, marginTop: 2, fontWeight: "700" }
});
