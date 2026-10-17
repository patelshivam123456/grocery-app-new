import React from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { fetchCatalog } from "../../store/slices/productSlice";
import { productsForCategory } from "../../services/categoryProducts";
import { colors } from "../../theme/colors";

export default function CategoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const listRef = React.useRef(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const selectedCategory = categories.find((category) => category.id === selectedId) || null;
  const visibleProducts = React.useMemo(() => productsForCategory(products, selectedCategory), [products, selectedCategory]);
  const tabs = React.useMemo(() => [{ id: null, name: "All" }, ...categories], [categories]);
  const selectCategory = (id) => {
    setSelectedId(id);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.browseHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" })}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#0D7163" />
        </Pressable>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.title}>Categories</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Search groceries" onPress={() => navigation.getParent()?.navigate("Search", { screen: "SearchHome" })} style={styles.searchButton}>
          <Feather name="search" size={21} color="#0D7163" />
        </Pressable>
      </View>
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
          {tabs.map((category) => {
            const active = category.id === (selectedCategory?.id ?? null);
            return (
              <Pressable key={category.id ?? "all"} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={category.name} onPress={() => selectCategory(category.id)} style={styles.categoryTab}>
                <View style={[styles.imageBox, active && styles.imageBoxActive]}>
                  {category.id === null ? <Text style={styles.allIcon}>🛒</Text> : <SafeRemoteImage uri={category.iconUrl} style={styles.photo} resizeMode="contain" fallback="▣" fallbackStyle={styles.fallbackIcon} />}
                </View>
                <Text numberOfLines={2} style={[styles.categoryName, active && styles.categoryNameActive]}>{category.name}</Text>
                {active ? <View style={styles.activeIndicator} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={visibleProducts}
        keyExtractor={(product) => String(product.id)}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeading}>
              <Text accessibilityRole="header" style={styles.resultsTitle}>{selectedCategory?.name || "All products"}</Text>
              <Text accessibilityLiveRegion="polite" style={styles.resultCount}>{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</Text>
            </View>
            {loading && visibleProducts.length > 0 ? <ActivityIndicator color="#0D7163" /> : null}
            {error ? <Pressable accessibilityRole="button" accessibilityLabel="Retry loading products" onPress={() => dispatch(fetchCatalog())} style={styles.errorBox}><Text style={styles.errorText}>{error} Tap to retry.</Text></Pressable> : null}
          </View>
        }
        renderItem={({ item }) => <ProductCard compact product={item} onPress={() => navigation.navigate("ProductDetails", { productId: item.id })} />}
        ListEmptyComponent={loading ? <ActivityIndicator color="#0D7163" style={styles.loading} /> : <EmptyState title={selectedCategory ? "No products in this category yet" : "No products found"} subtitle={selectedCategory ? "Explore another category for your everyday essentials." : "Please try loading the catalog again."} action={selectedCategory ? "View all products" : "Retry"} onPress={() => selectedCategory ? selectCategory(null) : dispatch(fetchCatalog())} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7FBF9" },
  browseHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F7FBF9" },
  headingCopy: { flex: 1 },
  backButton: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, color: "#123E32" },
  searchButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE9E1", alignItems: "center", justifyContent: "center" },
  categoryBar: { backgroundColor: "#F7FBF9", paddingTop: 4, borderBottomWidth: 1, borderBottomColor: "#DFEBE6" },
  categoryTabs: { paddingHorizontal: 12, gap: 8 },
  categoryTab: { width: 64, alignItems: "center", paddingBottom: 8 },
  imageBox: { width: 46, height: 46, borderRadius: 14, padding: 4, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3ECE6", alignItems: "center", justifyContent: "center" },
  imageBoxActive: { backgroundColor: "#E1F1E8", borderColor: "#0D7163" },
  photo: { width: "100%", height: "100%", borderRadius: 10 },
  allIcon: { fontSize: 25 },
  fallbackIcon: { fontSize: 24, color: "#0D7163" },
  categoryName: { color: "#6C7A70", fontSize: 10, lineHeight: 13, fontWeight: "600", marginTop: 5, textAlign: "center", minHeight: 26 },
  categoryNameActive: { color: "#0D7163", fontWeight: "800" },
  activeIndicator: { position: "absolute", bottom: 0, height: 3, width: 26, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: "#0D7163" },
  list: { flex: 1, backgroundColor: "#FFFFFF" },
  productContent: { paddingHorizontal: 16, paddingBottom: 28 },
  productRow: { justifyContent: "space-between", marginBottom: 20 },
  resultsHeader: { paddingVertical: 12, gap: 10 },
  resultsHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultsTitle: { flex: 1, color: "#203F31", fontSize: 17, fontWeight: "800" },
  resultCount: { color: "#728379", fontSize: 11 },
  loading: { marginTop: 36 },
  errorBox: { borderRadius: 12, padding: 12, backgroundColor: "#FFF0EF" },
  errorText: { color: colors.danger, fontSize: 12 }
});
