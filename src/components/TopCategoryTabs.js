import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function TopCategoryTabs({ items, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const active = item.value === selected;
        return (
          <Pressable key={item.value} onPress={() => onSelect(item.value)} style={[styles.tab, active && styles.tabActive]}>
            {item.emoji ? <Text style={styles.emoji}>{item.emoji}</Text> : null}
            <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            {active ? <View style={styles.underline} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  tab: { minWidth: 72, maxWidth: 140, minHeight: 48, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  tabActive: { borderColor: colors.primary, backgroundColor: "#F0FFF0" },
  emoji: { fontSize: 17, marginBottom: 2 },
  label: { fontSize: type.body, color: colors.muted, fontWeight: "800", textAlign: "center" },
  labelActive: { color: colors.text, fontWeight: "900" },
  underline: { position: "absolute", left: 14, right: 14, bottom: -1, height: 3, borderRadius: 2, backgroundColor: colors.primary }
});
