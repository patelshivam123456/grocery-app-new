import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function LogoutConfirmation({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss logout confirmation" onPress={onClose} style={styles.dim} />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.topRow}><View style={styles.symbol}><Feather name="log-out" size={25} color="#B05C55" /></View><Pressable accessibilityRole="button" accessibilityLabel="Close logout confirmation" onPress={onClose} style={styles.closeButton}><Feather name="x" size={21} color="#7F9185" /></Pressable></View>
          <Text accessibilityRole="header" style={styles.title}>Log out of Just Harvst?</Text>
          <Text style={styles.message}>You can log in again anytime with your mobile number.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.stayButton, pressed && styles.pressed]}><Text style={styles.stayText}>Stay logged in</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}><Text style={styles.logoutText}>Log out</Text><Feather name="log-out" size={16} color="#FFFFFF" /></Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,35,24,0.48)" },
  dialog: { width: "100%", maxWidth: 380, backgroundColor: "#FFFFFF", borderRadius: 23, padding: 22, gap: 13 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  symbol: { width: 54, height: 54, borderRadius: 17, backgroundColor: "#FBEEEB", alignItems: "center", justifyContent: "center" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginTop: -8, marginRight: -10 },
  title: { color: "#2D4936", fontSize: 21, lineHeight: 28, fontWeight: "700", letterSpacing: -0.4 },
  message: { color: "#748479", fontSize: 13, lineHeight: 21 },
  actions: { flexDirection: "row", gap: 10, marginTop: 9 },
  stayButton: { flex: 1.15, minHeight: 46, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#EFF7F2", borderWidth: 1, borderColor: "#DBE9DF", alignItems: "center", justifyContent: "center" },
  stayText: { color: "#0D7163", fontSize: 12, fontWeight: "700" },
  logoutButton: { flex: 1, minHeight: 46, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#AF5B55", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.75 }
});
