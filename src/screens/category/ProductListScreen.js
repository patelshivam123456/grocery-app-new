import React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import FloatingCartPill from "../../components/FloatingCartPill";
import ProductCard from "../../components/ProductCard";
import ProductQuickViewSheet from "../../components/ProductQuickViewSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { fetchProductsForCategory, setSort } from "../../store/slices/productSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const sortOptions = [
  { key: "popular", label: "Relevance (default)" },
  { key: "priceLow", label: "Price (low to high)" },
  { key: "priceHigh", label: "Price (high to low)" },
  { key: "discount", label: "Discount (high to low)" }
];

function goBackSafe(navigation) {
  if (navigation.canGoBack()) navigation.goBack();
  else navigation.navigate("CategoryHome");
}

function countBy(products, getValue) {
  return products.reduce((acc, product) => {
    const value = getValue(product);
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function firstImage(products, predicate) {
  const product = products.find(predicate);
  return product?.imageGallery?.[0] || product?.image;
}

function mapCountOptions(group, counts, extra = () => ({})) {
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, count]) => ({ group, value, label: `${value} (${count})`, ...extra(value, count) }));
}

function getFilterOptions(products, categories, typeProducts = products, openedCategoryIds = []) {
  const categoryTypeOptions = openedCategoryIds
    .map((id) => categories.find((cat) => cat.id === id))
    .filter(Boolean)
    .map((cat) => {
      const count = typeProducts.filter((product) => product.category === cat.id).length;
      if (!count) return null;
      return {
        group: "Type",
        kind: "category",
        value: cat.id,
        label: `${cat.name} (${count})`,
        image: firstImage(typeProducts, (product) => product.category === cat.id) || cat.emoji
      };
    })
    .filter(Boolean);
  const subcategoryTypeOptions = mapCountOptions(
    "Type",
    countBy(typeProducts, (product) => product.subCategory || product.section),
    (value) => ({
      kind: "subcategory",
      image: firstImage(typeProducts, (product) => (product.subCategory || product.section) === value)
    })
  );

  return {
    Type: [...categoryTypeOptions, ...subcategoryTypeOptions],
    Price: [
      { group: "Price", value: "below99", label: `Below ₹99 (${products.filter((product) => product.price < 99).length})` },
      { group: "Price", value: "99to199", label: `₹99 - ₹199 (${products.filter((product) => product.price >= 99 && product.price <= 199).length})` },
      { group: "Price", value: "above199", label: `Above ₹199 (${products.filter((product) => product.price > 199).length})` }
    ],
    "Country Of Origin": mapCountOptions("Country Of Origin", countBy(products, (product) => product.countryOfOrigin || "India")),
    Brand: mapCountOptions("Brand", countBy(products, (product) => product.brand)),
    Category: mapCountOptions("Category", countBy(products, (product) => product.categoryName), (value) => ({ categoryName: value })),
    Subcategory: mapCountOptions("Subcategory", countBy(products, (product) => product.subCategory || product.section)),
    Variants: mapCountOptions("Variants", countBy(products.flatMap((product) => (product.variants || []).map((variant) => ({ ...product, variantLabel: variant.variantName || variant.label }))), (product) => product.variantLabel)),
    "Taste Profile": [
      { group: "Taste Profile", value: "sweet", label: `Sweet (${products.filter((product) => /mango|banana|apple|melon|grape|berry|fruit/i.test(product.name)).length})` },
      { group: "Taste Profile", value: "fresh", label: `Fresh (${products.filter((product) => /fresh|premium|organic|farm/i.test(product.name + product.organicStatus)).length})` },
      { group: "Taste Profile", value: "leafy", label: `Leafy (${products.filter((product) => /leaf|spinach|methi|coriander|mint|lettuce|kale/i.test(product.name + product.section)).length})` }
    ],
    Discount: [
      { group: "Discount", value: "10plus", label: `10% or more (${products.filter((product) => parseInt(product.discount, 10) >= 10).length})` },
      { group: "Discount", value: "20plus", label: `20% or more (${products.filter((product) => parseInt(product.discount, 10) >= 20).length})` },
      { group: "Discount", value: "30plus", label: `30% or more (${products.filter((product) => parseInt(product.discount, 10) >= 30).length})` }
    ],
    Rating: [
      { group: "Rating", value: "4plus", label: `4★ & above (${products.filter((product) => product.rating >= 4).length})` },
      { group: "Rating", value: "45plus", label: `4.5★ & above (${products.filter((product) => product.rating >= 4.5).length})` }
    ],
    Availability: [
      { group: "Availability", value: "inStock", label: `In stock (${products.filter((product) => (product.stock ?? 1) > 0).length})` },
      { group: "Availability", value: "lowStock", label: `Low stock (${products.filter((product) => (product.stock ?? 99) > 0 && (product.stock ?? 99) <= 10).length})` }
    ]
  };
}

function productMatchesFilter(product, filter) {
  if (filter.group === "Type" && filter.kind === "category") return product.category === filter.value;
  if (filter.group === "Type" && filter.kind === "subcategory") return (product.subCategory || product.section) === filter.value;
  if (filter.group === "Brand") return product.brand === filter.value;
  if (filter.group === "Category") return product.categoryName === filter.value;
  if (filter.group === "Subcategory") return (product.subCategory || product.section) === filter.value;
  if (filter.group === "Variants") return (product.variants || []).some((variant) => (variant.variantName || variant.label) === filter.value);
  if (filter.group === "Country Of Origin") return (product.countryOfOrigin || "India") === filter.value;
  if (filter.group === "Price" && filter.value === "below99") return product.price < 99;
  if (filter.group === "Price" && filter.value === "99to199") return product.price >= 99 && product.price <= 199;
  if (filter.group === "Price" && filter.value === "above199") return product.price > 199;
  if (filter.group === "Discount" && filter.value === "10plus") return parseInt(product.discount, 10) >= 10;
  if (filter.group === "Discount" && filter.value === "20plus") return parseInt(product.discount, 10) >= 20;
  if (filter.group === "Discount" && filter.value === "30plus") return parseInt(product.discount, 10) >= 30;
  if (filter.group === "Rating" && filter.value === "4plus") return product.rating >= 4;
  if (filter.group === "Rating" && filter.value === "45plus") return product.rating >= 4.5;
  if (filter.group === "Availability" && filter.value === "inStock") return (product.stock ?? 1) > 0;
  if (filter.group === "Availability" && filter.value === "lowStock") return (product.stock ?? 99) > 0 && (product.stock ?? 99) <= 10;
  if (filter.group === "Taste Profile" && filter.value === "sweet") return /mango|banana|apple|melon|grape|berry|fruit/i.test(product.name);
  if (filter.group === "Taste Profile" && filter.value === "fresh") return /fresh|premium|organic|farm/i.test(product.name + product.organicStatus);
  if (filter.group === "Taste Profile" && filter.value === "leafy") return /leaf|spinach|methi|coriander|mint|lettuce|kale/i.test(product.name + product.section);
  return true;
}

function defaultFiltersForParams(categoryIds, products, categories) {
  return categoryIds
    .map((id) => {
      const cat = categories.find((item) => item.id === id);
      const count = products.filter((product) => product.category === id).length;
      if (!cat || !count) return null;
      return {
        group: "Type",
        kind: "category",
        value: cat.id,
        label: `${cat.name} (${count})`,
        image: firstImage(products, (product) => product.category === cat.id) || cat.emoji
      };
    })
    .filter(Boolean);
}

function applySelectedFilters(products, selectedFilters) {
  const byGroup = selectedFilters.reduce((acc, filter) => {
    acc[filter.group] = [...(acc[filter.group] || []), filter];
    return acc;
  }, {});
  return Object.values(byGroup).reduce(
    (items, filters) => items.filter((product) => filters.some((filter) => productMatchesFilter(product, filter))),
    products
  );
}

function SortSheet({ visible, selected, onClose, onSelect }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss sort options" style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sortSheetWrap}>
          <View style={[styles.sortSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            {sortOptions.map((option) => (
              <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected === option.key }} key={option.key} style={styles.radioRow} onPress={() => onSelect(option.key)}>
                <View style={[styles.radio, selected === option.key && styles.radioActive]}>{selected === option.key ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.sheetOption}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close sort options" hitSlop={8} style={styles.closeFloat} onPress={onClose}><Feather name="x" size={22} color="#FFFFFF" /></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function filterKey(filter) {
  return `${filter.group}:${filter.value}`;
}

function FilterSheet({ visible, selected, onChange, onClear, onClose, optionsByGroup, initialGroup = "Type" }) {
  const [group, setGroup] = React.useState(initialGroup);
  const [query, setQuery] = React.useState("");
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const groups = Object.keys(optionsByGroup).filter((item) => optionsByGroup[item]?.length);
  const activeGroup = groups.includes(group) ? group : groups[0] || "Type";
  const options = (optionsByGroup[activeGroup] || []).filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  const hasSelection = selected.length > 0;

  React.useEffect(() => {
    if (visible) {
      setGroup(initialGroup);
      setQuery("");
    }
  }, [initialGroup, visible]);

  const toggle = (item) => {
    const key = filterKey(item);
    onChange(selected.some((value) => filterKey(value) === key) ? selected.filter((value) => filterKey(value) !== key) : [...selected, item]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.sheetOverlay, { paddingTop: insets.top + 40 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss filters" style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.filterSheetWrap, { height: Math.max(200, Math.min(height * 0.82, height - insets.top - 48)) }]}>
          <View style={[styles.filterSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.filterHeading}><View><Text accessibilityRole="header" style={styles.sheetTitle}>Filters</Text><Text style={styles.filterSubtitle}>Find your favourites, your way</Text></View></View>
            <View style={styles.sheetSearch}><Feather name="search" size={18} color="#7A897A" /><TextInput accessibilityLabel="Search filters" value={query} onChangeText={setQuery} placeholder="Search across filters" placeholderTextColor="#A0AA9A" style={styles.sheetInput} /></View>
            <View style={styles.filterBody}>
              <ScrollView style={styles.filterGroups} showsVerticalScrollIndicator={false}>
                {groups.map((item) => {
                  const count = selected.filter((value) => value.group === item).length;
                  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: activeGroup === item }} key={item} onPress={() => setGroup(item)} style={[styles.groupItem, activeGroup === item && styles.groupItemActive]}><Text style={[styles.groupText, activeGroup === item && styles.groupTextActive]}>{item}</Text>{count > 0 ? <View style={styles.groupCount}><Text style={styles.groupCountText}>{count}</Text></View> : null}</Pressable>;
                })}
              </ScrollView>
              <ScrollView style={styles.filterOptions} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.filterOptionsContent}>
                <Text style={styles.optionsHeading}>{activeGroup}</Text>
                {options.map((item) => {
                  const active = selected.some((value) => filterKey(value) === filterKey(item));
                  return <Pressable key={filterKey(item)} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityLabel={item.label} style={[styles.checkRow, active && styles.checkRowActive]} onPress={() => toggle(item)}>
                    <View style={[styles.checkbox, active && styles.checkboxActive]}>{active ? <Feather name="check" size={12} color="#FFFFFF" /> : null}</View>
                    {item.image ? <View style={styles.optionThumb}><SafeRemoteImage uri={item.image} style={styles.optionPhoto} resizeMode="contain" fallback={item.image} fallbackStyle={styles.optionEmoji} /></View> : null}
                    <Text numberOfLines={2} style={[styles.sheetOption, active && styles.sheetOptionActive]}>{item.label}</Text>
                  </Pressable>;
                })}
                {!options.length ? <Text style={styles.noFilterResults}>No filters match your search.</Text> : null}
              </ScrollView>
            </View>
            <View style={styles.sheetButtons}>
              <Pressable accessibilityRole="button" accessibilityLabel="Clear filters" disabled={!hasSelection} style={[styles.sheetButton, styles.clearButton, !hasSelection && styles.sheetButtonDisabled]} onPress={onClear}><Text style={[styles.clearText, !hasSelection && styles.disabledText]}>Clear all</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Apply filters" style={[styles.sheetButton, styles.applyButton]} onPress={onClose}><Text style={styles.applyText}>Apply filters{hasSelection ? ` (${selected.length})` : ""}</Text><Feather name="arrow-right" size={16} color="#FFFFFF" /></Pressable>
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close filters" hitSlop={8} style={styles.closeFloat} onPress={onClose}><Feather name="x" size={22} color="#FFFFFF" /></Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ProductListScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const params = route.params?.params || route.params || {};
  const categories = useSelector((state) => state.products.categories);
  const category = categories.find((item) => item.id === params.categoryId) || categories[0];
  const title = params.title || params.categoryName || category?.name || "Products";
  const productIds = Array.isArray(params.productIds) ? params.productIds : [];
  const categoryIds = Array.isArray(params.categoryIds) ? params.categoryIds : params.categoryId ? [params.categoryId] : [];
  const products = useSelector((state) => state.products.items);
  const loading = useSelector((state) => state.products.productsLoading);
  const error = useSelector((state) => state.products.error);
  const sort = useSelector((state) => state.products.sort);
  const [section, setSection] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterGroup, setFilterGroup] = React.useState("Type");
  const [selectedFilters, setSelectedFilters] = React.useState([]);
  const [quickProduct, setQuickProduct] = React.useState(null);
  const openedCategoryIds = categoryIds.length ? categoryIds : category?.id ? [category.id] : [];
  const openedSubcategory = React.useMemo(() => {
    const nestedSubcategory = categories
      .flatMap((item) => item.subcategories || [])
      .find((item) => openedCategoryIds.includes(item.id));
    if (nestedSubcategory) return nestedSubcategory;
    if (params.subCategoryId || params.subcategoryId || params.subCategoryName || params.subcategoryName) {
      return {
        id: params.subCategoryId || params.subcategoryId,
        name: params.subCategoryName || params.subcategoryName || params.categoryName || title,
        iconUrl: params.subCategoryIconUrl || params.subcategoryIconUrl
      };
    }
    return null;
  }, [categories, openedCategoryIds, params.categoryName, params.subCategoryIconUrl, params.subCategoryId, params.subCategoryName, params.subcategoryIconUrl, params.subcategoryId, params.subcategoryName, title]);

  const paramsSignature = JSON.stringify({ title, productIds, categoryIds, categoryId: params.categoryId });
  React.useEffect(() => {
    setSection("All");
    setQuery("");
    setSelectedFilters(productIds.length ? [] : defaultFiltersForParams(openedCategoryIds, products, categories));
  }, [categories, paramsSignature, productIds.length, products]);

  React.useEffect(() => {
    if (params.categoryId) dispatch(fetchProductsForCategory(params.categoryId));
  }, [dispatch, params.categoryId]);

  const baseProducts = React.useMemo(() => {
    const productsById = productIds.length ? products.filter((product) => productIds.includes(product.id)) : [];
    if (productsById.length) return productsById;
    if (openedCategoryIds.length) {
      return products.filter((product) => openedCategoryIds.includes(product.category) || openedCategoryIds.includes(product.subCategoryPublicId));
    }
    return products;
  }, [openedCategoryIds, productIds, products]);

  const railProducts = productIds.length ? baseProducts : products.filter((product) => openedCategoryIds.includes(product.category) || openedCategoryIds.includes(product.subCategoryPublicId));
  const categoryOptions = [
    { value: "All", label: openedSubcategory?.name || "All", emoji: openedSubcategory?.iconUrl || category?.emoji, image: firstImage(railProducts, () => true) || openedSubcategory?.iconUrl || category?.iconUrl || "▣" },
    ...openedCategoryIds.flatMap((id) => {
      const cat = categories.find((item) => item.id === id) || categories.flatMap((item) => item.subcategories || []).find((item) => item.id === id);
      if (!cat) return [];
      return (cat.subcategories || []).map((item) => ({
        value: item.name,
        label: item.name,
        emoji: cat.iconUrl,
        image: firstImage(railProducts, (product) => product.subCategoryPublicId === item.id || (product.subCategory || product.section) === item.name) || item.iconUrl || cat.iconUrl || "▣"
      }));
    })
  ];

  const optionsByGroup = React.useMemo(() => getFilterOptions(baseProducts, categories, railProducts, openedCategoryIds), [baseProducts, categories, openedCategoryIds, railProducts]);
  const activeFilterCount = selectedFilters.length;

  let list = baseProducts.filter((product) => {
    const searchable = [
      product.name,
      product.section,
      product.subCategory,
      product.category,
      product.categoryName,
      product.brand,
      product.sku,
      product.shortDescription,
      ...(product.variants || []).map((variant) => variant.variantName),
      ...(product.tags || [])
    ].filter(Boolean).join(" ").toLowerCase();
    const sectionMatch = section === "All" || (product.subCategory || product.section) === section || product.category === section || product.subCategoryPublicId === section;
    const queryMatch = !query.trim() || searchable.includes(query.toLowerCase());
    return sectionMatch && queryMatch;
  });
  list = applySelectedFilters(list, selectedFilters);
  if (sort === "priceLow") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "priceHigh") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "discount") list = [...list].sort((a, b) => parseInt(b.discount, 10) - parseInt(a.discount, 10));

  const openFilter = (groupName = "Type") => {
    setFilterGroup(groupName);
    setFilterOpen(true);
  };
  const openSearch = (voiceSearch = false) => {
    const parent = navigation.getParent();
    if (parent) parent.navigate("Search", { screen: "SearchHome", params: { voiceSearch } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => goBackSafe(navigation)} style={styles.circleButton}>
          <Text style={styles.headerIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Speak to search" onPress={() => openSearch(true)} style={styles.circleButton}><Feather name="mic" size={18} color="#347448" /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Search products" onPress={() => openSearch()} style={styles.circleButton}>
          <Text style={styles.headerAction}>⌕</Text>
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={styles.content}>
          <View style={styles.catalogBody}>
            <View style={styles.sideColumn}>
            <ScrollView style={styles.sideRail} contentContainerStyle={styles.sideRailContent} showsVerticalScrollIndicator={false}>
              {categoryOptions.map((item) => {
                const active = item.value === section;
                return (
                  <Pressable key={item.value} onPress={() => setSection(item.value)} style={[styles.railTab, active && styles.railTabActive]}>
                    <View style={styles.railImageWrap}>
                      <SafeRemoteImage uri={item.image} style={styles.railPhoto} fallback={item.image || item.emoji} fallbackStyle={styles.railEmojiLarge} />
                    </View>
                    <Text numberOfLines={3} style={[styles.railLabel, active && styles.railLabelActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            </View>
            <View style={styles.listColumn}>
            <View style={styles.listPane}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroller} contentContainerStyle={styles.chipRow}>
                <Pressable onPress={() => openFilter("Type")} style={[styles.filterChip, activeFilterCount && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, activeFilterCount && styles.filterChipTextActive]}>☷ Filters{activeFilterCount ? ` (${activeFilterCount})` : ""} ▾</Text>
                </Pressable>
                <Pressable onPress={() => setSortOpen(true)} style={styles.filterChip}><Text style={styles.filterChipText}>↕ Sort ▾</Text></Pressable>
                <Pressable onPress={() => openFilter("Type")} style={styles.filterChip}><Text style={styles.filterChipText}>Type ▾</Text></Pressable>
                <Pressable onPress={() => openFilter("Price")} style={styles.filterChip}><Text style={styles.filterChipText}>Price ▾</Text></Pressable>
              </ScrollView>
              {/* {selectedFilters.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipRow}>
                  {selectedFilters.map((filter) => (
                    <Pressable key={filterKey(filter)} onPress={() => setSelectedFilters((current) => current.filter((item) => filterKey(item) !== filterKey(filter)))} style={styles.activeChip}>
                      <Text style={styles.activeChipText}>{filter.label} ×</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setSelectedFilters([])} style={styles.clearChip}><Text style={styles.clearChipText}>Clear all</Text></Pressable>
                </ScrollView>
              ) : null} */}
              <ScrollView contentContainerStyle={[styles.productContent, { paddingBottom: 186 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                {/* <View style={styles.hero}>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroTitle}>{section === "All" ? "Fresh seasonal fruits" : categoryOptions.find((item) => item.value === section)?.label}</Text>
                    <Text style={styles.heroSub}>Nutritional goodness in every bite</Text>
                  </View>
                  <Text style={styles.heroEmoji}>{categoryOptions.find((item) => item.value === section)?.emoji || category.emoji}</Text>
                </View> */}
                <View style={styles.grid}>
                  {list.map((product) => (
                    <ProductCard
                      key={product.id}
                      railGrid
                      product={product}
                      onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
                      onViewDetails={() => setQuickProduct(product)}
                    />
                  ))}
                </View>
                {loading ? <ActivityIndicator color={colors.primary} /> : null}
                {error ? <Pressable onPress={() => params.categoryId && dispatch(fetchProductsForCategory(params.categoryId))}><Text style={styles.errorText}>{error} Tap to retry.</Text></Pressable> : null}
                {list.length === 0 ? <Text style={styles.empty}>No products found for this filter.</Text> : null}
              </ScrollView>
            </View>
            </View>
          </View>
        </View>
      </View>

      <FloatingCartPill navigation={navigation} bottomOffset={6 + insets.bottom} />
      <SortSheet
        visible={sortOpen}
        selected={sort}
        onClose={() => setSortOpen(false)}
        onSelect={(value) => {
          dispatch(setSort(value));
          setSortOpen(false);
        }}
      />
      <FilterSheet
        visible={filterOpen}
        selected={selectedFilters}
        onChange={setSelectedFilters}
        onClear={() => setSelectedFilters([])}
        onClose={() => setFilterOpen(false)}
        optionsByGroup={optionsByGroup}
        initialGroup={filterGroup}
      />
      <ProductQuickViewSheet
        visible={!!quickProduct}
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        onOpenFull={() => {
          const id = quickProduct?.id;
          setQuickProduct(null);
          if (id) navigation.navigate("ProductDetails", { productId: id });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FBF1",paddingBottom:10 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FFFDF2", borderBottomWidth: 1, borderBottomColor: colors.faint },
  circleButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  headerIcon: { fontSize: 20, color: colors.text, lineHeight: 22 },
  headerAction: { fontSize: 18, color: colors.text, fontWeight: "800" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: type.heading, fontWeight: "600", color: colors.text },
  main: { flex: 1 },
  catalogBody: { flex: 1, flexDirection: "row", backgroundColor: "#F4FAE7",paddingTop: 0 },
  sideColumn: { width: "25%" },
  listColumn: { width: "75%" },
  sideRail: { width: 80, backgroundColor: colors.surface, borderRightWidth: 1, borderRightColor: colors.faint },
  sideRailContent: { paddingTop: 0, paddingBottom: 170 },
  railTab: { minHeight: 78, alignItems: "center", justifyContent: "center", paddingHorizontal: 2, paddingVertical: 4, borderRightWidth: 4, borderRightColor: "transparent" },
  railTabActive: { backgroundColor: "#F0FFF0", borderRightColor: colors.primary },
  railImageWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F6F8FC", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 2 },
  railPhoto: { width: "100%", height: "100%" },
  railEmojiLarge: { fontSize: 22 },
  railLabel: { color: colors.muted, fontSize: type.body, lineHeight: 11, fontWeight: "800", textAlign: "center" },
  railLabelActive: { color: colors.text, fontWeight: "900" },
  listPane: { flex: 1, minWidth: 0, backgroundColor: "#F4FAE7" },
  content: { flex: 1, backgroundColor: "#F4FAE7" },
  searchBox: { height: 44, marginHorizontal: 12, marginTop: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: colors.text, fontSize: type.subheading, paddingVertical: 0 },
  chipScroller: { flexGrow: 0, height: 48 },
  chipRow: { gap: 7,  paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.faint },
  filterChip: { height: 36, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  filterChipText: { fontSize: type.body, color: colors.text, fontWeight: "800" },
  filterChipActive: { borderColor: colors.primary, backgroundColor: "#EAFBEF" },
  filterChipTextActive: { color: colors.primaryDark },
  activeChipRow: { gap: 8, paddingHorizontal: 8, paddingBottom: 8, backgroundColor: "#fff" },
  activeChip: { minHeight: 30, borderRadius: 15, backgroundColor: "#EAFBEF", borderWidth: 1, borderColor: "#CBEFD3", paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  activeChipText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" },
  clearChip: { minHeight: 30, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  clearChipText: { color: colors.muted, fontSize: type.body, fontWeight: "900" },
  productContent: { paddingHorizontal: 8, paddingTop: 18, paddingBottom: 8, gap: 12 },
  hero: { minHeight: 94, borderRadius: 0, backgroundColor: "#EFFAD9", padding: 12, marginHorizontal: -8, marginTop: -8, marginBottom: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroCopy: { flex: 1, minWidth: 0 },
  heroTitle: { fontSize: 18, color: colors.text, fontWeight: "900", lineHeight: 22 },
  heroSub: { marginTop: 5, fontSize: type.subheading, color: colors.text },
  heroEmoji: { fontSize: 42 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  productCard: { width: "48%", marginBottom: 16 },
  imageBox: { height: 142, borderRadius: 10, backgroundColor: "#F7F7FB", borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  productEmoji: { fontSize: 58 },
  imageActions: { position: "absolute", top: 6, right: 6, flexDirection: "row", gap: 5 },
  imageIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: type.subheading, color: colors.text, fontWeight: "900" },
  heartActive: { color: "#EF476F" },
  dots: { position: "absolute", left: 8, bottom: 8, flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D4D8DE" },
  dotActive: { backgroundColor: "#9EA7B3" },
  quantityRow: { marginTop: -35, minHeight: 38, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quantityText: { fontSize: type.body, color: colors.text, fontWeight: "900" },
  addButton: { minWidth: 58, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  addButtonText: { fontSize: type.subheading, color: colors.primary, fontWeight: "900" },
  stepper: { minWidth: 66, height: 38, borderRadius: 10, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 8 },
  stepperText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  price: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  mrp: { fontSize: type.body, color: colors.muted, textDecorationLine: "line-through" },
  productName: { marginTop: 3, minHeight: 34, fontSize: type.subheading, color: colors.text, fontWeight: "900" },
  meta: { marginTop: 5, fontSize: type.body, color: colors.muted, fontWeight: "800" },
  empty: { marginTop: 20, textAlign: "center", color: colors.muted, fontSize: type.body },
  errorText: { marginTop: 12, textAlign: "center", color: colors.danger, fontSize: type.body, fontWeight: "800" },
  sheetOverlay: { flex: 1, justifyContent: "flex-end", paddingTop: 48, backgroundColor: "rgba(19,34,23,0.55)" },
  closeFloat: { position: "absolute", alignSelf: "center", top: -23, width: 46, height: 46, borderRadius: 23, backgroundColor: "#203B2A", borderWidth: 4, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", zIndex: 10, elevation: 8 },
  sortSheetWrap: { flexShrink: 1, maxHeight: "90%" },
  sortSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 32, paddingHorizontal: 20 },
  filterSheetWrap: { maxHeight: "100%" },
  filterSheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 32, paddingHorizontal: 16 },
  filterHeading: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, color: "#243B2B", fontWeight: "800", letterSpacing: -0.5 },
  filterSubtitle: { color: "#93A08C", fontSize: 11, marginTop: 5 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#B8C9B4", alignItems: "center", justifyContent: "center" },
  radioActive: { borderWidth: 2, borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  sheetOption: { flex: 1, fontSize: 12, lineHeight: 17, color: "#53654D", fontWeight: "600" },
  sheetSearch: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#E8EDE4", backgroundColor: "#F7F9F4", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  searchIcon: { fontSize: 22, color: colors.text },
  sheetInput: { flex: 1, fontSize: 12, color: colors.text },
  filterBody: { flex: 1, minHeight: 0, borderRadius: 15, borderWidth: 1, borderColor: "#E9EEE4", backgroundColor: "#FFFFFF", flexDirection: "row", overflow: "hidden" },
  filterGroups: { width: 104, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: "#E9EEE4", backgroundColor: "#F7F9F3" },
  groupItem: { minHeight: 57, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 10, borderLeftWidth: 3, borderLeftColor: "transparent", gap: 5 },
  groupItemActive: { backgroundColor: "#EAF5E6", borderLeftColor: "#28834A" },
  groupText: { fontSize: 11, color: "#86927D", fontWeight: "600", lineHeight: 16 },
  groupTextActive: { color: "#2A7942", fontWeight: "800" },
  groupCount: { alignSelf: "flex-start", backgroundColor: "#D4EBCB", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  groupCountText: { color: "#2A7942", fontSize: 8, fontWeight: "800" },
  filterOptions: { flex: 1 },
  filterOptionsContent: { padding: 9, paddingBottom: 18 },
  optionsHeading: { color: "#A0AC98", fontSize: 9, fontWeight: "700", marginHorizontal: 6, marginTop: 5, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  checkRow: { minHeight: 58, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 7, paddingVertical: 8, marginBottom: 5 },
  checkRowActive: { backgroundColor: "#EFF7EA" },
  optionThumb: { width: 31, height: 34, borderRadius: 8, backgroundColor: "#F8FAF5", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  optionPhoto: { width: "100%", height: "100%" },
  optionEmoji: { fontSize: 20 },
  sheetOptionActive: { color: "#286E3C", fontWeight: "800" },
  checkbox: { width: 17, height: 17, borderRadius: 5, borderWidth: 1.5, borderColor: "#BDCDB6", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#28834A", borderColor: "#28834A" },
  noFilterResults: { color: "#9AA58F", fontSize: 11, lineHeight: 17, padding: 10 },
  sheetButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  sheetButton: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  clearButton: { flex: 0.8, borderWidth: 1, borderColor: "#D8E4D0", backgroundColor: "#FFFFFF" },
  applyButton: { flex: 1.2, backgroundColor: "#28834A" },
  sheetButtonDisabled: { borderColor: "#E9EDE4", backgroundColor: "#F8FAF5" },
  clearText: { fontSize: 12, color: "#43804F", fontWeight: "700" },
  applyText: { fontSize: 12, color: "#FFFFFF", fontWeight: "800" },
  disabledText: { color: "#BBC4B3" }
});
