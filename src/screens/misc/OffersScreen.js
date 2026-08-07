import React from "react";
import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { coupons } from "../../data/mockData";
import { applyCoupon } from "../../store/slices/cartSlice";
import { selectCartTotals } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OffersScreen({ navigation }) {
  const dispatch = useDispatch();
  const totals = useSelector(selectCartTotals);
  const activeCoupon = useSelector((state) => state.cart.coupon);
  const insets = useSafeAreaInsets();
  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("Tabs", { screen: "Home" }));
  const useCoupon = (coupon) => {
    if (totals.subtotal < coupon.min) {
      Alert.alert("Coupon not available", `Add items worth ₹${coupon.min - totals.subtotal} more to use ${coupon.title}.`);
      return;
    }
    dispatch(applyCoupon(coupon));
    Alert.alert("Coupon applied", `${coupon.title} applied to your cart.`);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconCircle}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={styles.iconCircle}>
          <Feather name="tag" size={19} color={colors.orange} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        {coupons.map((coupon) => {
          const active = activeCoupon?.id === coupon.id;
          return (
            <View key={coupon.id} style={[styles.offer, active && styles.offerActive]}>
              <Text style={styles.code}>{coupon.title}</Text>
              <Text style={styles.title}>Get ₹{coupon.discount} off</Text>
              <Text style={styles.sub}>Valid on cart value above ₹{coupon.min}.</Text>
              <Pressable onPress={() => useCoupon(coupon)} style={[styles.apply, active && styles.applyActive]}>
                <Text style={[styles.applyText, active && styles.applyTextActive]}>{active ? "Applied" : "Apply offer"}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FB" },
  header: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: colors.text, fontSize: type.heading, fontWeight: "900" },
  content: { padding: 12, gap: 12 },
  offer: { backgroundColor: "#FFF2D3", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#F5D47C" },
  offerActive: { borderColor: colors.primary, backgroundColor: "#ECFFF1" },
  code: { color: colors.orange, fontWeight: "900", fontSize: type.heading },
  title: { color: colors.text, fontWeight: "900", fontSize: type.heading, marginTop: 6 },
  sub: { color: colors.muted, marginTop: 5, lineHeight: 15, fontSize: type.body },
  apply: { alignSelf: "flex-start", marginTop: 10, minHeight: 36, borderRadius: 8, backgroundColor: colors.primary, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  applyActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  applyText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  applyTextActive: { color: colors.primaryDark }
});
