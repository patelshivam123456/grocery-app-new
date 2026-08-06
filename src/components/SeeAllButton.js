import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SafeRemoteImage from "./SafeRemoteImage";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function SeeAllButton({ products = [], onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <View style={styles.preview}>
        {products.slice(0, 3).map((item, index) => (
          <View key={item.id} style={[styles.bubble, index > 0 && styles.overlap]}>
            <SafeRemoteImage uri={item.imageGallery?.[0]} style={styles.photo} fallback={item.image} fallbackStyle={styles.emoji} />
          </View>
        ))}
      </View>
      <Text style={styles.text}>See All Products</Text>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F7F8FB", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 12 },
  preview: { flexDirection: "row", alignItems: "center" },
  bubble: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%", borderRadius: 14 },
  overlap: { marginLeft: -10 },
  emoji: { fontSize: 15 },
  text: { color: "#233B74", fontSize: type.subheading, fontWeight: "900" },
  arrow: { color: "#233B74", fontSize: 22, lineHeight: 24 }
});
