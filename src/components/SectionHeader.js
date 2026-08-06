import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function SectionHeader({ title, action, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  action: { color: colors.primary, fontWeight: "800", fontSize: type.subheading }
});
