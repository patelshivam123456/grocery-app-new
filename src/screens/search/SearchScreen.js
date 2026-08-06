import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import Screen from "../../components/Screen";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import CommerceBottomStack, { bottomStackHeight } from "../../components/CommerceBottomStack";
import { colors } from "../../theme/colors";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const normalizedQuery = query.trim();
  const popular = useMemo(() => categories.slice(0, 5).map((category) => category.name).filter(Boolean), [categories]);
  const results = useMemo(
    () => normalizedQuery ? products.filter((item) => productMatchesSearch(item, normalizedQuery)) : [],
    [normalizedQuery, products]
  );
  const rememberSearch = useCallback((text = query) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setRecent((items) => [cleanText, ...items.filter((item) => item !== cleanText)].slice(0, 5));
  }, [query]);
  const pick = useCallback((text) => {
    setQuery(text);
    rememberSearch(text);
  }, [rememberSearch]);
  return (
    <View style={styles.root}>
      <Screen contentStyle={styles.content}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => rememberSearch()}
          placeholder="Search groceries"
          style={styles.input}
          returnKeyType="search"
          autoFocus
        />
        {!normalizedQuery ? (
          <>
            <Text style={styles.title}>Recent searches</Text>
            <View style={styles.chips}>{recent.map((item) => <Chip key={item} text={item} onPress={() => pick(item)} />)}</View>
            <Text style={styles.title}>Popular searches</Text>
            <View style={styles.chips}>{popular.map((item) => <Chip key={item} text={item} onPress={() => pick(item)} />)}</View>
          </>
        ) : results.length ? (
          <View style={styles.grid}>{results.map((item) => <ProductCard key={item.id} compact product={item} onPress={() => navigation.navigate("ProductDetails", { productId: item.id })} />)}</View>
        ) : (
          <EmptyState icon="🔎" title="No results found" subtitle="Try searching for a category, brand or product name." />
        )}
      </Screen>
      <CommerceBottomStack navigation={navigation} showUnlock={false} bottomOffset={82} />
    </View>
  );
}

function productMatchesSearch(product, query) {
  const searchable = [
    product.name,
    product.brand,
    product.categoryName,
    product.subCategory,
    product.section,
    ...(product.tags || []),
    ...(product.variants || []).map((variant) => variant.variantName || variant.label)
  ].filter(Boolean).join(" ").toLowerCase();
  return searchable.includes(query.toLowerCase());
}

function Chip({ text, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.chip}><Text style={styles.chipText}>{text}</Text></Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: bottomStackHeight + 82 },
  input: { height: 52, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 14 },
  title: { fontSize: 18, fontWeight: "900", color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.faint },
  chipText: { color: colors.text, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }
});
