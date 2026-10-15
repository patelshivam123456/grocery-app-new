import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CouponFeedbackModal({ feedback, onClose, buttonLabel = "Keep shopping" }) {
  const success = feedback?.type === "success";
  const coupon = feedback?.coupon;
  return (
    <Modal visible={Boolean(feedback)} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss coupon message" style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View accessibilityViewIsModal style={styles.card}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close coupon message" hitSlop={8} onPress={onClose} style={styles.close}><Feather name="x" size={18} color="#7D8C78" /></Pressable>
          <View style={[styles.halo, !success && styles.warningHalo]}><View style={[styles.badge, !success && styles.warningBadge]}><Feather name={success ? "check" : "shopping-bag"} size={28} color="#FFFFFF" /></View></View>
          <Text style={styles.eyebrow}>{success ? "A LITTLE EXTRA JOY" : "YOU'RE ALMOST THERE"}</Text>
          <Text accessibilityRole="header" style={styles.title}>{success ? "Coupon applied!" : "Add a little more"}</Text>
          <Text style={styles.amount}>{success ? `₹${coupon?.discount || 0} saved` : `₹${feedback?.remaining || 0} to go`}</Text>
          <View style={styles.codePill}><Feather name="tag" size={13} color="#52825C" /><Text style={styles.code}>{coupon?.title}</Text></View>
          <Text style={styles.message}>{success ? "A little less to pay, a little more to smile about. Your discount is added to your basket." : `Add ₹${feedback?.remaining || 0} more to your basket to unlock ₹${coupon?.discount || 0} off with this coupon.`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={buttonLabel} onPress={onClose} style={styles.button}><Text style={styles.buttonText}>{buttonLabel}</Text><Feather name="arrow-right" size={17} color="#FFFFFF" /></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(20,36,26,0.55)", justifyContent: "center", alignItems: "center", padding: 26 },
  card: { width: "100%", maxWidth: 360, backgroundColor: "#FFFFFF", borderRadius: 25, padding: 24, paddingTop: 30, alignItems: "center" },
  close: { position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: "#F4F7F0", alignItems: "center", justifyContent: "center" },
  halo: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#ECF7E7", alignItems: "center", justifyContent: "center", marginBottom: 19 },
  badge: { width: 59, height: 59, borderRadius: 30, backgroundColor: "#2E9653", alignItems: "center", justifyContent: "center" },
  warningHalo: { backgroundColor: "#FFF5DF" },
  warningBadge: { backgroundColor: "#D49B3F" },
  eyebrow: { color: "#90A183", fontSize: 8, fontWeight: "800", letterSpacing: 1.6 },
  title: { color: "#294333", fontSize: 23, fontWeight: "800", letterSpacing: -0.6, marginTop: 8, textAlign: "center" },
  amount: { color: "#30834A", fontSize: 32, fontWeight: "900", letterSpacing: -1, marginTop: 10 },
  codePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F2F7ED", borderRadius: 8, paddingHorizontal: 13, paddingVertical: 7, marginTop: 13 },
  code: { color: "#52825C", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  message: { color: "#88967F", fontSize: 12, lineHeight: 19, textAlign: "center", marginTop: 15, marginBottom: 23 },
  button: { width: "100%", minHeight: 47, borderRadius: 12, backgroundColor: "#28834A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" }
});
