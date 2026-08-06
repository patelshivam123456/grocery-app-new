import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function AppButton({ title, onPress, variant = "primary", loading, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        variant === "ghost" && styles.ghost,
        variant === "outline" && styles.outline,
        pressed && styles.pressed,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? "#fff" : colors.primary} /> : <Text style={[styles.text, variant !== "primary" && styles.altText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  ghost: { backgroundColor: "transparent" },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  text: { color: "#fff", fontWeight: "800", fontSize: type.heading },
  altText: { color: colors.primary }
});
