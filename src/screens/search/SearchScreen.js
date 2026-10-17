import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Screen from "../../components/Screen";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import CommerceBottomStack, { bottomStackHeight } from "../../components/CommerceBottomStack";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";
import useVoiceSearch from "../../hooks/useVoiceSearch";
import { productMatchesSearch } from "../../services/productSearch";

const sortOptions = [
  { key: "popular", label: "Relevance" },
  { key: "priceLow", label: "Price low to high" },
  { key: "priceHigh", label: "Price high to low" },
  { key: "discount", label: "Discount" }
];

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("popular");
  const [filters, setFilters] = useState([]);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const normalizedQuery = query.trim();
  const popular = useMemo(() => categories.slice(0, 5).map((category) => category.name).filter(Boolean), [categories]);
  const rawResults = useMemo(
    () => normalizedQuery ? products.filter((item) => productMatchesSearch(item, normalizedQuery)) : [],
    [normalizedQuery, products]
  );
  const filterOptions = useMemo(() => buildFilterOptions(rawResults), [rawResults]);
  const results = useMemo(() => {
    let items = applyFilters(rawResults, filters);
    if (sort === "priceLow") items = [...items].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") items = [...items].sort((a, b) => b.price - a.price);
    if (sort === "discount") items = [...items].sort((a, b) => parseInt(b.discount, 10) - parseInt(a.discount, 10));
    return items;
  }, [filters, rawResults, sort]);

  const rememberSearch = useCallback((text = query) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setRecent((items) => [cleanText, ...items.filter((item) => item !== cleanText)].slice(0, 5));
  }, [query]);
  const pick = useCallback((text) => {
    setQuery(text);
    setFilters([]);
    rememberSearch(text);
  }, [rememberSearch]);
  const voice = useVoiceSearch((text, isFinal) => {
    setQuery(text);
    setFilters([]);
    if (isFinal) rememberSearch(text);
  });
  const isFocused = useIsFocused();
  useFocusEffect(useCallback(() => () => voice.cancel(), [voice.cancel]));
  React.useEffect(() => {
    if (isFocused && route?.params?.voiceSearch) {
      navigation.setParams({ voiceSearch: false });
      voice.start();
    }
  }, [isFocused, route?.params?.voiceSearch, navigation, voice.start]);

  return (
    <View style={styles.root}>
      <Screen contentStyle={styles.content}>
        <View style={[styles.searchRow, voice.status === "listening" && styles.searchRowListening]}>
          <Feather name="search" size={19} color="#7B8876" />
          <TextInput
          value={query}
          onChangeText={(text) => {
            voice.cancel();
            setQuery(text);
            setFilters([]);
          }}
          onSubmitEditing={() => rememberSearch()}
          placeholder={voice.status === "listening" ? "Listening…" : "Search products or categories"}
          style={styles.input}
          returnKeyType="search"
          autoFocus={!route?.params?.voiceSearch}
        />
          <Pressable accessibilityRole="button" accessibilityLabel={voice.status === "idle" ? "Speak to search" : "Stop voice search"} onPress={voice.toggle} style={[styles.micButton, voice.status !== "idle" && styles.micButtonActive]}><Feather name={voice.status === "listening" ? "square" : "mic"} size={19} color={voice.status !== "idle" ? "#FFFFFF" : "#347448"} /></Pressable>
        </View>
        {voice.status !== "idle" || voice.error ? <View accessibilityLiveRegion="polite" style={styles.voiceHint}><Feather name={voice.error ? "info" : "mic"} size={14} color={voice.error ? "#A66B48" : "#347448"} /><Text style={[styles.voiceHintText, voice.error && styles.voiceHintError]}>{voice.error || (voice.status === "requesting" ? "Getting the microphone ready…" : "Listening… say a product or category name")}</Text></View> : null}
        {!normalizedQuery ? (
          <>
            <Text style={styles.title}>Recent searches</Text>
            <View style={styles.chips}>{recent.map((item) => <Chip key={item} text={item} onPress={() => pick(item)} />)}</View>
            <Text style={styles.title}>Popular searches</Text>
            <View style={styles.chips}>{popular.map((item) => <Chip key={item} text={item} onPress={() => pick(item)} />)}</View>
          </>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <Pressable onPress={() => setFilterOpen(true)} style={[styles.filterChip, filters.length && styles.filterChipActive]}>
                <Text style={[styles.filterText, filters.length && styles.filterTextActive]}>☷ Filter{filters.length ? ` (${filters.length})` : ""}</Text>
              </Pressable>
              {sortOptions.map((option) => (
                <Pressable key={option.key} onPress={() => setSort(option.key)} style={[styles.filterChip, sort === option.key && styles.filterChipActive]}>
                  <Text style={[styles.filterText, sort === option.key && styles.filterTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {results.length ? (
              <View style={styles.grid}>{results.map((item) => <ProductCard key={item.id} grid product={item} onPress={() => navigation.navigate("ProductDetails", { productId: item.id })} />)}</View>
            ) : (
              <EmptyState icon="🔎" title="No results found" subtitle="Try removing filters or searching another product." />
            )}
          </>
        )}
      </Screen>
      <SearchFilterModal
        visible={filterOpen}
        options={filterOptions}
        selected={filters}
        onChange={setFilters}
        onClear={() => setFilters([])}
        onClose={() => setFilterOpen(false)}
      />
      <CommerceBottomStack navigation={navigation} showUnlock={false} bottomOffset={0} />
    </View>
  );
}

function SearchFilterModal({ visible, options, selected, onChange, onClear, onClose }) {
  const toggle = (option) => {
    const key = filterKey(option);
    onChange(selected.some((item) => filterKey(item) === key) ? selected.filter((item) => filterKey(item) !== key) : [...selected, option]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.filterSheet}>
          <Text style={styles.modalTitle}>Filter results</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(options).map(([group, groupOptions]) => groupOptions.length ? (
              <View key={group} style={styles.filterGroup}>
                <Text style={styles.groupTitle}>{group}</Text>
                {groupOptions.map((option) => {
                  const active = selected.some((item) => filterKey(item) === filterKey(option));
                  return (
                    <Pressable key={filterKey(option)} onPress={() => toggle(option)} style={[styles.checkRow, active && styles.checkRowActive]}>
                      <View style={[styles.checkbox, active && styles.checkboxActive]}>{active ? <Text style={styles.tick}>✓</Text> : null}</View>
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null)}
          </ScrollView>
          <View style={styles.modalActions}>
            <Pressable onPress={onClear} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable>
            <Pressable onPress={onClose} style={styles.applyButton}><Text style={styles.applyText}>Apply</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buildFilterOptions(products) {
  return {
    Category: countOptions(products, "Category", (product) => product.categoryName || product.category),
    Brand: countOptions(products, "Brand", (product) => product.brand),
    Price: [
      { group: "Price", value: "below99", label: `Below ₹99 (${products.filter((product) => product.price < 99).length})` },
      { group: "Price", value: "99to199", label: `₹99 - ₹199 (${products.filter((product) => product.price >= 99 && product.price <= 199).length})` },
      { group: "Price", value: "above199", label: `Above ₹199 (${products.filter((product) => product.price > 199).length})` }
    ],
    Discount: [
      { group: "Discount", value: "10plus", label: `10% or more (${products.filter((product) => parseInt(product.discount, 10) >= 10).length})` },
      { group: "Discount", value: "20plus", label: `20% or more (${products.filter((product) => parseInt(product.discount, 10) >= 20).length})` }
    ]
  };
}

function countOptions(products, group, getValue) {
  const counts = products.reduce((acc, product) => {
    const value = getValue(product);
    if (value) acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([value, count]) => ({ group, value, label: `${value} (${count})` }));
}

function filterKey(filter) {
  return `${filter.group}:${filter.value}`;
}

function applyFilters(products, filters) {
  if (!filters.length) return products;
  const byGroup = filters.reduce((acc, filter) => {
    acc[filter.group] = [...(acc[filter.group] || []), filter];
    return acc;
  }, {});
  return Object.values(byGroup).reduce(
    (items, groupFilters) => items.filter((product) => groupFilters.some((filter) => productMatchesFilter(product, filter))),
    products
  );
}

function productMatchesFilter(product, filter) {
  if (filter.group === "Category") return (product.categoryName || product.category) === filter.value;
  if (filter.group === "Brand") return product.brand === filter.value;
  if (filter.group === "Price" && filter.value === "below99") return product.price < 99;
  if (filter.group === "Price" && filter.value === "99to199") return product.price >= 99 && product.price <= 199;
  if (filter.group === "Price" && filter.value === "above199") return product.price > 199;
  if (filter.group === "Discount" && filter.value === "10plus") return parseInt(product.discount, 10) >= 10;
  if (filter.group === "Discount" && filter.value === "20plus") return parseInt(product.discount, 10) >= 20;
  return true;
}

function Chip({ text, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.chip}><Text style={styles.chipText}>{text}</Text></Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: bottomStackHeight + 82 },
  searchRow: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: colors.faint, paddingLeft: 13, paddingRight: 7 },
  searchRowListening: { borderColor: "#75AA7F", backgroundColor: "#F4FAF0" },
  input: { flex: 1, height: 50, color: colors.text, fontSize: 12 },
  micButton: { width: 39, height: 39, borderRadius: 12, backgroundColor: "#EFF6E9", alignItems: "center", justifyContent: "center" },
  micButtonActive: { backgroundColor: "#347448" },
  voiceHint: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 4 },
  voiceHintText: { flex: 1, color: "#78916E", fontSize: 11, lineHeight: 16 },
  voiceHintError: { color: "#A66B48" },
  title: { fontSize: type.heading, fontWeight: "600", color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.faint },
  chipText: { color: colors.text, fontWeight: "800", fontSize: type.subheading },
  filterRow: { gap: 8, paddingVertical: 2 },
  filterChip: { height: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.faint, backgroundColor: colors.surface, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  filterChipActive: { borderColor: colors.primary, backgroundColor: "#EAFBEF" },
  filterText: { color: colors.text, fontSize: type.body, fontWeight: "800" },
  filterTextActive: { color: colors.primaryDark },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", columnGap: 8, rowGap: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" },
  filterSheet: { maxHeight: "76%", backgroundColor: colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 14, gap: 12 },
  modalTitle: { color: colors.text, fontSize: type.heading, fontWeight: "600" },
  filterGroup: { gap: 6, marginBottom: 12 },
  groupTitle: { color: colors.muted, fontSize: type.subheading, fontWeight: "800" },
  checkRow: { minHeight: 42, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10 },
  checkRowActive: { backgroundColor: "#EAFBEF" },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: colors.primary },
  tick: { color: "#fff", fontSize: type.body, fontWeight: "900" },
  optionText: { color: colors.text, fontSize: type.subheading },
  optionTextActive: { color: colors.primaryDark, fontWeight: "800" },
  modalActions: { flexDirection: "row", gap: 10 },
  clearButton: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  applyButton: { flex: 1, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  clearText: { color: colors.primary, fontSize: type.subheading, fontWeight: "800" },
  applyText: { color: "#fff", fontSize: type.subheading, fontWeight: "800" }
});
