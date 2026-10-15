import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FREE_DELIVERY_MIN } from "../store/selectors";

const bonusOffers = [
  { title: "Unlock extra ₹50 OFF", threshold: 899 },
  { title: "Unlock extra ₹100 OFF", threshold: 1499 },
  { title: "Unlock extra ₹150 OFF", threshold: 2099 },
  { title: "Unlock extra ₹200 OFF", threshold: 2699 }
];

export default function UnlockFreeDeliveryBottomSheet({ visible, onClose, subtotal = 0 }) {
  const insets = useSafeAreaInsets();
  const amount = Math.max(Number(subtotal) || 0, 0);
  const offers = [
    { title: "Free delivery", threshold: FREE_DELIVERY_MIN },
    ...bonusOffers
  ].map((offer) => {
    const remaining = Math.max(offer.threshold - amount, 0);
    return {
      ...offer,
      active: remaining === 0,
      remaining,
      progress: Math.min(amount / offer.threshold, 1)
    };
  });

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss offers" style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheetWrap}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>A LITTLE EXTRA, ON US</Text>
              <Text accessibilityRole="header" style={styles.title}>Offers for you</Text>
              <Text style={styles.subtitle}>Fill your basket. Unlock a little more joy.</Text>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.offerList} showsVerticalScrollIndicator={false}>
              {offers.map((offer, index) => (
                <View key={offer.title} style={styles.offerRow}>
                  <View style={styles.timeline}>
                    <View style={[styles.milestone, offer.active && styles.milestoneActive]}><Feather name={offer.active ? "check" : index === 0 ? "truck" : "gift"} size={15} color={offer.active ? "#FFFFFF" : "#7C8C7E"} /></View>
                    {index < offers.length - 1 ? <View style={[styles.line, offer.active && styles.lineActive]} /> : null}
                  </View>
                  <View style={[styles.offer, offer.active && styles.offerActive]}>
                    <View style={styles.offerTop}>
                      <Text style={styles.offerTitle}>{offer.active && index === 0 ? "Free delivery unlocked" : offer.title}</Text>
                      <View style={[styles.status, offer.active && styles.statusActive]}><Feather name={offer.active ? "check-circle" : "lock"} size={11} color={offer.active ? "#237344" : "#8B938A"} /><Text style={[styles.statusText, offer.active && styles.statusTextActive]}>{offer.active ? "Unlocked" : "Locked"}</Text></View>
                    </View>
                    <Text style={styles.offerSub}>{offer.active ? "You're all set — this milestone is unlocked" : `Add ₹${offer.remaining} more to your basket`}</Text>
                    <View accessible accessibilityRole="progressbar" accessibilityLabel={`${offer.title} progress`} accessibilityValue={{ min: 0, max: offer.threshold, now: Math.min(amount, offer.threshold) }} style={styles.progress}><View style={[styles.progressFill, { width: `${offer.progress * 100}%` }]} /></View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close offers" hitSlop={8} style={styles.close} onPress={onClose}><Feather name="x" size={23} color="#FFFFFF" /></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17,28,22,0.55)" },
  sheetWrap: { maxHeight: "86%", flexShrink: 1 },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, flexShrink: 1, paddingHorizontal: 16, paddingTop: 32 },
  close: { position: "absolute", top: -24, alignSelf: "center", width: 48, height: 48, borderRadius: 24, backgroundColor: "#203B2A", borderWidth: 4, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", zIndex: 10, elevation: 8 },
  header: { paddingHorizontal: 6, paddingBottom: 20 },
  eyebrow: { color: "#6C9776", fontSize: 9, fontWeight: "800", letterSpacing: 1.7 },
  title: { color: "#203B2A", fontWeight: "900", fontSize: 25, letterSpacing: -0.6, marginTop: 6 },
  subtitle: { color: "#8B968B", fontSize: 12, lineHeight: 17, marginTop: 6 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  offerList: { paddingBottom: 5 },
  offerRow: { flexDirection: "row", gap: 10 },
  timeline: { width: 30, alignItems: "center", paddingTop: 10 },
  milestone: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F0F4EE", alignItems: "center", justifyContent: "center" },
  milestoneActive: { backgroundColor: "#319657" },
  line: { flex: 1, width: 2, minHeight: 28, backgroundColor: "#E7EDE4", marginVertical: 5 },
  lineActive: { backgroundColor: "#95CBA1" },
  offer: { flex: 1, minHeight: 86, marginBottom: 12, borderRadius: 15, backgroundColor: "#F8FAF6", borderWidth: 1, borderColor: "#E9EDE4", padding: 13 },
  offerActive: { backgroundColor: "#ECF8EE", borderColor: "#A3D6AF" },
  offerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  offerTitle: { flex: 1, color: "#2C402F", fontSize: 13, lineHeight: 18, fontWeight: "800" },
  offerSub: { color: "#8A9587", marginTop: 6, fontSize: 10, lineHeight: 15 },
  status: { borderRadius: 8, backgroundColor: "#EBEFE8", paddingHorizontal: 7, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { color: "#8B938A", fontWeight: "700", fontSize: 9 },
  statusActive: { backgroundColor: "#D7EFDC" },
  statusTextActive: { color: "#237344" },
  progress: { height: 5, borderRadius: 3, backgroundColor: "#E3EADD", marginTop: 10, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: "#319657" }
});
