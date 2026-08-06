import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import ProductCard from "../../components/ProductCard";
import { bottomStackHeight } from "../../components/CommerceBottomStack";
import EmptyState from "../../components/EmptyState";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { fetchCatalog } from "../../store/slices/productSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function CategoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const openCategory = (cat) => navigation.navigate("ProductList", { categoryId: cat.id, categoryName: cat.name });
  const openProduct = (product) => navigation.navigate("ProductDetails", { productId: product.id });

  return (
    <View style={styles.root}>
      <Screen contentStyle={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop by category</Text>
          <Text style={styles.subtitle}>Fresh groceries, snacks and daily essentials</Text>
        </View>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <Pressable key={cat.id} onPress={() => openCategory(cat)} style={styles.card}>
              <View style={styles.imageBox}>
                <SafeRemoteImage uri={cat.iconUrl} style={styles.photo} fallback="▣" fallbackStyle={styles.icon} />
              </View>
              <Text style={styles.name}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Pressable onPress={() => dispatch(fetchCatalog())}><Text style={styles.errorText}>{error} Tap to retry.</Text></Pressable> : null}
        {!loading && !categories.length && !error ? <EmptyState title="No categories found" subtitle="Please try again shortly." action="Retry" onPress={() => dispatch(fetchCatalog())} /> : null}
        <Text style={styles.title}>All products</Text>
        <View style={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} grid product={product} onPress={() => openProduct(product)} />
          ))}
        </View>
      </Screen>
      {/* <CommerceBottomStack navigation={navigation} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  screen: { gap: 14, paddingBottom: bottomStackHeight },
  header: { gap: 3 },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, fontSize: type.body, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", rowGap: 12 },
  card: { width: "20%", alignItems: "center", paddingHorizontal: 4 },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#E8F6F2",
    borderWidth: 1,
    borderColor: "#DCEFEB",
    alignItems: "center",
    justifyContent: "center"
  },
  icon: { fontSize: 30 },
  photo: { width: "100%", height: "100%" },
  name: { fontSize: type.body, color: colors.text, fontWeight: "900", marginTop: 6, lineHeight: 13, textAlign: "center" },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", columnGap: 8, rowGap: 8 },
  errorText: { color: colors.danger, fontSize: type.body, fontWeight: "800", textAlign: "center" }
});
