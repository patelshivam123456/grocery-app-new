import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { selectCartLines, selectCartTotals } from "../store/selectors";
import SafeRemoteImage from "./SafeRemoteImage";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function FloatingCartPill({ navigation, bottomOffset, onPress, style }) {
  const lines = useSelector(selectCartLines);
  const totals = useSelector(selectCartTotals);
  const insets = useSafeAreaInsets();
  const preview = lines.slice(0, 2);

  if (!totals.count) return null;

  return (
    <Pressable
      onPress={onPress || (() => navigation.navigate("Cart"))}
      style={[styles.pill, { bottom: bottomOffset == null ? 92 + insets.bottom : bottomOffset }, style]}
    >
      <View style={styles.previewWrap}>
        {preview.map(({ product }, index) => (
          <View key={`${product.id || product.name}-${index}`} style={[styles.preview, index > 0 && styles.previewOverlap]}>
            <SafeRemoteImage uri={product.imageGallery?.[0]} style={styles.previewPhoto} fallback={product.image} fallbackStyle={styles.previewEmoji} />
          </View>
        ))}
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>View cart</Text>
        <Text numberOfLines={1} style={styles.sub}>{totals.count} items • ₹{totals.total}</Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    alignSelf: "center",
    width: "72%",
    minWidth: 240,
    maxWidth: 310,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#218A10",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 6,
    shadowColor: "#0B3D09",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    zIndex: 20
  },
  previewWrap: { width: 50, flexDirection: "row", alignItems: "center" },
  preview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "#E9F8E5",
    alignItems: "center",
    justifyContent: "center"
  },
  previewOverlap: { marginLeft: -12 },
  previewPhoto: { width: "100%", height: "100%", borderRadius: 16 },
  previewEmoji: { fontSize: 18 },
  copy: { flex: 1, marginLeft: 4, minWidth: 0 },
  title: { color: "#fff", fontSize: type.heading, fontWeight: "900", lineHeight: 16 },
  sub: { color: "#DDFBD5", marginTop: 1, fontWeight: "700", fontSize: type.body },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(10, 105, 8, 0.32)",
    alignItems: "center",
    justifyContent: "center"
  },
  arrowText: { color: "#fff", fontSize: 28, lineHeight: 31, fontWeight: "300" }
});
