import React from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import CommerceBottomStack from "../../components/CommerceBottomStack";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OrderSuccessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scale = React.useRef(new Animated.Value(0.5)).current;
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [fade, scale, slide]);

  const viewOrders = () => navigation.getParent()?.navigate("Orders", { screen: "OrdersHome" });
  const trackOrder = () => {
    if (navigation.getState()?.routeNames?.includes("Tracking")) {
      navigation.navigate("Tracking");
      return;
    }
    navigation.getParent()?.navigate("Orders", { screen: "Tracking" });
  };

  return (
    <Screen scroll={false} contentStyle={[styles.wrap, { paddingBottom: 112 + insets.bottom }]}>
      <Animated.View style={[styles.successIcon, { opacity: fade, transform: [{ scale }] }]}>
        <Feather name="check" size={44} color="#fff" />
      </Animated.View>
      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.sub}>Your groceries are being packed and will move to live tracking shortly.</Text>
      </Animated.View>

      <View style={styles.timeline}>
        {[
          ["Order confirmed", "check-circle"],
          ["Packing started", "shopping-bag"],
          ["Rider assigned", "navigation"]
        ].map(([label, icon]) => (
          <View key={label} style={styles.timelineItem}>
            <View style={styles.timelineIcon}><Feather name={icon} size={17} color={colors.primaryDark} /></View>
            <Text style={styles.timelineText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton title="Track Order" onPress={trackOrder} />
        <AppButton title="View Orders" variant="outline" onPress={viewOrders} />
        <Pressable onPress={() => navigation.navigate("HomeFeed")} style={styles.homeButton}>
          <Text style={styles.homeText}>Back to Home</Text>
        </Pressable>
      </View>
      {/* <CommerceBottomStack navigation={navigation} showUnlock={false} bottomOffset={insets.bottom} /> */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F5F6FB" },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: "#073D21", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  copy: { alignItems: "center", marginTop: 18 },
  title: { fontSize: 30, fontWeight: "900", color: colors.text },
  sub: { color: colors.muted, textAlign: "center", lineHeight: 22, marginTop: 8, fontSize: type.subheading },
  timeline: { width: "100%", borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, padding: 12, gap: 10, marginTop: 22 },
  timelineItem: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 10 },
  timelineIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  timelineText: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  actions: { width: "100%", gap: 10, marginTop: 16 },
  homeButton: { height: 42, alignItems: "center", justifyContent: "center" },
  homeText: { color: colors.primaryDark, fontWeight: "900", fontSize: type.subheading }
});
