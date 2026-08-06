import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { selectCartTotals } from "../store/selectors";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function CartPill({
  navigation,
  bottomOffset,
  onPress,
  style,
  inline = false,
}) {
  const totals = useSelector(selectCartTotals);
  const insets = useSafeAreaInsets();
  if (!totals.count) return null;

  return (
    <Pressable
      onPress={onPress || (() => navigation.navigate("Cart"))}
      style={[
  styles.pill,
  !inline && {
    position: "absolute",
    bottom: bottomOffset == null
      ? 92 + insets.bottom
      : bottomOffset,
  },
  style,
]}
    >
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>Cart</Text>
        <Text numberOfLines={1} style={styles.sub}>{totals.count} items • ₹{totals.total}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
  // REMOVE position absolute from here

  flex: 1,
  height: 54,
  borderRadius: 10,
  backgroundColor: "#218A10",

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 12,
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
