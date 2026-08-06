import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function EmptyState({ icon = "🧺", title, subtitle, action, onPress }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {action ? <AppButton title={action} onPress={onPress} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 360, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  icon: { fontSize: 58 },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center", lineHeight: 15, fontSize: type.body }
});
