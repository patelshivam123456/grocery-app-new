import React from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

export default function OrderSuccessScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const orderNumber = route.params?.orderNumber;
  const scale = React.useRef(new Animated.Value(0.5)).current;
  const fade = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]);
    animation.start();
    return () => animation.stop();
  }, [fade, scale]);
  const viewOrders = () => navigation.getParent()?.navigate("Orders", { screen: "OrdersHome" });
  const trackOrder = () => {
    if (navigation.getState()?.routeNames?.includes("Tracking")) navigation.navigate("Tracking");
    else navigation.getParent()?.navigate("Orders", { screen: "Tracking" });
  };
  const goHome = () => {
    if (navigation.getState()?.routeNames?.includes("HomeFeed")) navigation.navigate("HomeFeed");
    else navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <View style={styles.brand}><Feather name="shopping-bag" size={16} color="#27834A" /><Text style={styles.brandText}>JUST HARVST</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={goHome} style={styles.close}><Feather name="x" size={19} color="#365440" /></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Animated.View style={[styles.halo, { opacity: fade, transform: [{ scale }] }]}><View style={styles.successIcon}><Feather name="check" size={36} color="#FFFFFF" /></View></Animated.View>
          <Text style={styles.eyebrow}>FRESH PICKS. HAPPY MOMENTS.</Text>
          <Text accessibilityRole="header" style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>Order placed. Freshness, coming right up.</Text>
          {orderNumber ? <View style={styles.orderPill}><Feather name="check-circle" size={12} color="#3E7C4E" /><Text selectable style={styles.orderNumber}>Order #{orderNumber}</Text></View> : null}
        </View>
        <View style={styles.preparingCard}>
          <View style={styles.bagIcon}><Feather name="shopping-bag" size={25} color="#2A7842" /></View>
          <View style={styles.flex}><Text style={styles.eyebrow}>NEXT UP</Text><Text style={styles.preparingTitle}>Packing your fresh picks</Text><Text style={styles.body}>Follow every update with live tracking.</Text></View>
        </View>
        <View style={styles.journeyCard}>
          <Text style={styles.sectionTitle}>Your order's journey</Text>
          {[
            { title: "Order confirmed", subtitle: "We've received your order", icon: "check", active: true },
            { title: "Fresh picks being packed", subtitle: "Getting your basket ready", icon: "shopping-bag" },
            { title: "Out for delivery", subtitle: "Your rider will bring it to your door", icon: "truck" }
          ].map((step, index) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.rail}><View style={[styles.stepIcon, step.active && styles.activeIcon]}><Feather name={step.icon} size={16} color={step.active ? "#FFFFFF" : "#8A998F"} /></View>{index < 2 ? <View style={styles.stepLine} /> : null}</View>
              <View style={styles.stepCopy}><Text style={[styles.stepTitle, step.active && styles.activeTitle]}>{step.title}</Text><Text style={styles.body}>{step.subtitle}</Text></View>
              {step.active ? <View style={styles.doneBadge}><Text style={styles.doneText}>DONE</Text></View> : null}
            </View>
          ))}
        </View>
        <View style={styles.reassurance}><Feather name="heart" size={15} color="#568164" /><Text style={styles.body}>A little less waiting. A little more fresh.</Text></View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Track Order" onPress={trackOrder} style={styles.trackButton}><View><Text style={styles.trackTitle}>Track your order</Text><Text style={styles.trackSubtitle}>See what's happening, live</Text></View><Feather name="arrow-right" size={22} color="#FFFFFF" /></Pressable>
        <View style={styles.secondaryActions}>
          <Pressable accessibilityRole="button" onPress={viewOrders} style={styles.secondaryButton}><Text style={styles.secondaryText}>View Orders</Text><Feather name="chevron-right" size={14} color="#39764B" /></Pressable>
          <View style={styles.divider} />
          <Pressable accessibilityRole="button" onPress={goHome} style={styles.secondaryButton}><Text style={styles.secondaryText}>Back to Home</Text><Feather name="home" size={13} color="#39764B" /></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFCF8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  brand: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandText: { color: "#365440", fontWeight: "800", fontSize: 10, letterSpacing: 1.6 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EDF3E9", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 18, paddingBottom: 16, gap: 14 },
  hero: { alignItems: "center", paddingTop: 16, paddingBottom: 10 },
  halo: { width: 108, height: 108, borderRadius: 54, backgroundColor: "#E5F4DA", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 8, fontWeight: "800", letterSpacing: 1.4, color: "#7F9672" },
  title: { color: "#203D2A", fontSize: 32, fontWeight: "900", letterSpacing: -1, marginTop: 7 },
  subtitle: { color: "#768373", fontSize: 12, marginTop: 5, textAlign: "center", lineHeight: 18 },
  orderPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, backgroundColor: "#EEF5E8", marginTop: 13 },
  orderNumber: { color: "#3E7C4E", fontSize: 10, fontWeight: "700", flexShrink: 1 },
  preparingCard: { borderRadius: 18, backgroundColor: "#EAF4E4", padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  bagIcon: { width: 47, height: 51, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  preparingTitle: { color: "#2D5336", fontSize: 14, fontWeight: "800", marginTop: 5 },
  body: { color: "#84917D", fontSize: 10, lineHeight: 16, marginTop: 4 },
  journeyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBF0E6", borderRadius: 18, padding: 17, paddingBottom: 10 },
  sectionTitle: { color: "#2C4433", fontSize: 14, fontWeight: "800", marginBottom: 18 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  rail: { width: 30, alignItems: "center" },
  stepIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F1F4EF", alignItems: "center", justifyContent: "center" },
  activeIcon: { backgroundColor: "#29924D" },
  stepLine: { width: 1, height: 22, backgroundColor: "#E3EBDD", marginVertical: 3 },
  stepCopy: { flex: 1, paddingTop: 1, paddingBottom: 15 },
  stepTitle: { color: "#6E7D71", fontSize: 12, fontWeight: "700" },
  activeTitle: { color: "#2D603B" },
  doneBadge: { backgroundColor: "#EAF5E5", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, marginTop: 2 },
  doneText: { color: "#508351", fontSize: 7, fontWeight: "800", letterSpacing: 0.5 },
  reassurance: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 4 },
  footer: { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#EAF0E5", padding: 16, paddingTop: 12, gap: 7 },
  trackButton: { backgroundColor: colors.primary, borderRadius: 16, minHeight: 57, paddingHorizontal: 19, paddingVertical: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  trackSubtitle: { color: "#D3EED9", fontSize: 10, marginTop: 3 },
  secondaryActions: { flexDirection: "row", alignItems: "center" },
  secondaryButton: { flex: 1, minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  secondaryText: { color: "#39764B", fontSize: 11, fontWeight: "700" },
  divider: { width: 1, height: 13, backgroundColor: "#E5EBE0" }
});
