import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FREE_DELIVERY_MIN } from "../store/selectors";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

const bonusOffers = [
  { title: "Unlock extra ₹50 OFF", threshold: 899 },
  { title: "Unlock extra ₹100 OFF", threshold: 1499 },
  { title: "Unlock extra ₹150 OFF", threshold: 2099 },
  { title: "Unlock extra ₹200 OFF", threshold: 2699 }
];

export default function UnlockFreeDeliveryBottomSheet({ visible, onClose, subtotal = 0 }) {
  const offers = [
    { title: "Free delivery", threshold: FREE_DELIVERY_MIN },
    ...bonusOffers
  ].map((offer) => {
    const remaining = Math.max(offer.threshold - subtotal, 0);
    return {
      ...offer,
      active: remaining === 0,
      remaining,
      progress: Math.min(subtotal / offer.threshold, 1)
    };
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <View style={styles.sheet}>
          <Text style={styles.title}>Offers for you</Text>
          {offers.map((offer, index) => (
            <View key={offer.title} style={styles.offerRow}>
              <View style={styles.timeline}>
                <View style={styles.lock}><Text style={styles.lockText}>▣</Text></View>
                {index < offers.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={[styles.offer, offer.active && styles.offerActive]}>
                <View style={styles.offerCopy}>
                  <Text style={[styles.offerTitle, !offer.active && styles.offerMuted]}>{offer.active && offer.threshold === FREE_DELIVERY_MIN ? "Free delivery unlocked" : offer.title}</Text>
                  <Text style={[styles.offerSub, !offer.active && styles.offerMuted]}>{offer.active ? "Unlocked" : `Shop for ₹${offer.remaining} more`}</Text>
                  <View style={styles.progress}><View style={[styles.progressFill, { width: `${offer.progress * 100}%` }]} /></View>
                </View>
                <View style={[styles.locked, offer.active && styles.unlocked]}>
                  <Text style={[styles.lockedText, offer.active && styles.unlockedText]}>{offer.active ? "Unlocked" : "Locked"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.72)" },
  close: { position: "absolute", alignSelf: "center", bottom: "68%", width: 54, height: 54, borderRadius: 40, backgroundColor: "#171821", alignItems: "center", justifyContent: "center", zIndex: 2 },
  closeText: { color: "#fff", fontSize: 34, lineHeight: 36 },
  sheet: { backgroundColor: "#0E131A", borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 14, paddingTop: 22, paddingBottom: 34 },
  title: { color: "#fff", fontWeight: "900", fontSize: type.heading, marginBottom: 16 },
  offerRow: { flexDirection: "row", gap: 10 },
  timeline: { width: 26, alignItems: "center" },
  lock: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#3B424D", alignItems: "center", justifyContent: "center" },
  lockText: { color: "#fff", fontSize: 9 },
  line: { flex: 1, width: 2, minHeight: 34, backgroundColor: "#515866", marginVertical: 4 },
  offer: { flex: 1, minHeight: 66, marginBottom: 12, borderRadius: 14, backgroundColor: "#1B2430", padding: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  offerActive: { backgroundColor: "#fff", borderWidth: 4, borderColor: colors.success },
  offerCopy: { flex: 1, minWidth: 0 },
  offerTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  offerSub: { color: colors.muted, marginTop: 5, fontSize: type.subheading, fontWeight: "700" },
  offerMuted: { color: "#9DA6B6" },
  locked: { borderRadius: 9, backgroundColor: "#E8ECF2", paddingHorizontal: 12, paddingVertical: 8 },
  lockedText: { color: "#7A8492", fontWeight: "900", fontSize: type.body },
  unlocked: { backgroundColor: "#EAFBEF" },
  unlockedText: { color: colors.primaryDark },
  progress: { height: 6, borderRadius: 3, backgroundColor: "#EEF1F4", marginTop: 12, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.success }
});
