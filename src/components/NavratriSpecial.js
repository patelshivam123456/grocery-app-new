import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SafeRemoteImage from "./SafeRemoteImage";

const collections = [
  { title: "Puja essentials", emoji: "🪔", color: "#FFE4BD", keywords: /\b(puja|pooja|agarbatti|incense|diya|dhoop|camphor|kumkum|roli|cotton wick)\b/i },
  { title: "Vrat essentials", emoji: "🥥", color: "#F5E4BC", keywords: /\b(vrat|fasting|sabudana|sago|makhana|kuttu|singhara|samak|sendha)\b/i },
  { title: "Fresh fruits", emoji: "🍎", color: "#F8D5BD", keywords: /\b(fruit|fruits|apple|banana|pomegranate|orange|papaya|grapes|coconut)\b/i }
];

export default function NavratriSpecial({ products, categories, onShop }) {
  const picks = React.useMemo(() => collections.map((collection) => ({
    ...collection,
    products: products.filter((product) => {
      const category = categories.find((item) => item.id === product.category);
      return collection.keywords.test([
        product.name, product.categoryName, product.subCategory, product.section,
        category?.name, ...(product.tags || [])
      ].filter(Boolean).join(" "));
    })
  })), [products, categories]);

  return (
    <View style={styles.section}>
      <View pointerEvents="none" style={styles.garland}>
        {Array.from({ length: 13 }, (_, index) => <View key={index} style={[styles.flower, index % 2 === 0 && styles.goldFlower]} />)}
      </View>
      <View style={styles.headingRow}>
        <Text style={styles.diya}>🪔</Text>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>THE FESTIVE EDIT</Text>
          <Text accessibilityRole="header" style={styles.title}>Navratri Special</Text>
          <Text style={styles.subtitle}>For nine nights of little celebrations</Text>
        </View>
        <Text style={styles.diya}>🪔</Text>
      </View>
      <View style={styles.cards}>
        {picks.map((collection) => {
          const product = collection.products[0];
          return (
            <Pressable
              key={collection.title}
              accessibilityRole="button"
              accessibilityLabel={`Shop ${collection.title}`}
              disabled={!product}
              onPress={() => onShop(collection.title, collection.products)}
              style={({ pressed }) => [styles.card, { backgroundColor: collection.color }, pressed && styles.pressed]}
            >
              <Text style={styles.cardTitle}>{collection.title}</Text>
              <View style={styles.imageWrap}>
                <SafeRemoteImage uri={product?.imageGallery?.[0] || product?.image} style={styles.photo} resizeMode="contain" fallback={collection.emoji} fallbackStyle={styles.emoji} />
              </View>
              <Text style={styles.shop}>{product ? "Shop now ›" : "Coming soon"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: "#FFF4E8", borderRadius: 20, padding: 12, paddingTop: 24, overflow: "hidden", borderWidth: 1, borderColor: "#F1D9B9" },
  garland: { position: "absolute", top: -6, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around" },
  flower: { width: 13, height: 13, borderRadius: 7, backgroundColor: "#F3A14F", borderWidth: 2, borderColor: "#ED8B36" },
  goldFlower: { backgroundColor: "#F9D88D", borderColor: "#EDC269", marginTop: 4 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 14 },
  headingCopy: { flex: 1, alignItems: "center" },
  diya: { fontSize: 25 },
  eyebrow: { color: "#B76C36", fontSize: 8, fontWeight: "800", letterSpacing: 1.8, textAlign: "center" },
  title: { color: "#7A2F40", fontSize: 25, fontWeight: "900", letterSpacing: -0.7, textAlign: "center", marginTop: 4 },
  subtitle: { color: "#9B7A68", fontSize: 10, textAlign: "center", marginTop: 4 },
  cards: { flexDirection: "row", gap: 8 },
  card: { flex: 1, minWidth: 0, borderRadius: 13, paddingHorizontal: 5, paddingTop: 10, paddingBottom: 10, alignItems: "center", borderWidth: 1, borderColor: "#FFF9F0" },
  pressed: { opacity: 0.8 },
  cardTitle: { color: "#612133", fontSize: 11, fontWeight: "800", textAlign: "center", minHeight: 28 },
  imageWrap: { width: "100%", height: 60, marginVertical: 4 },
  photo: { width: "100%", height: "100%", borderRadius: 8 },
  emoji: { fontSize: 40 },
  shop: { color: "#791D34", fontSize: 10, fontWeight: "900", marginTop: 3 }
});
