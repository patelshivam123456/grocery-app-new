import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";
import SectionHeader from "../../components/SectionHeader";
import SkeletonRow from "../../components/SkeletonRow";
import LocationSheet from "../../components/LocationSheet";
import ProductQuickViewSheet from "../../components/ProductQuickViewSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import CommerceBottomStack, { bottomStackHeight } from "../../components/CommerceBottomStack";
import { banners } from "../../data/mockData";
import { selectSelectedAddress } from "../../store/selectors";
import { fetchCatalog } from "../../store/slices/productSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [quickProduct, setQuickProduct] = React.useState(null);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const recentIds = useSelector((state) => state.products.recentlyViewed);
  const address = useSelector(selectSelectedAddress);
  const recent = React.useMemo(() => recentIds.map((id) => products.find((item) => item.id === id)).filter(Boolean), [products, recentIds]);
  const goProduct = React.useCallback((id) => navigation.navigate("ProductDetails", { productId: id }), [navigation]);
  const activeCategory = React.useMemo(() => categories.find((cat) => cat.id === activeTab), [activeTab, categories]);
  const activeIds = activeCategory ? [activeCategory.id] : null;
  const filteredCategories = React.useMemo(() => {
    if (!activeCategory) return categories;
    return activeCategory.subcategories?.length ? activeCategory.subcategories : [activeCategory];
  }, [activeCategory, categories]);
  const filteredProducts = React.useMemo(() => (activeIds ? products.filter((item) => activeIds.includes(item.category)) : products), [activeIds, products]);
  const homeTabs = React.useMemo(() => [{ id: "all", label: "All", iconUrl: null }, ...categories.map((cat) => ({ id: cat.id, label: cat.name, iconUrl: cat.iconUrl }))], [categories]);
  const activeLabel = homeTabs.find((tab) => tab.id === activeTab)?.label || "All";
  const openCategory = React.useCallback((cat) => navigation.getParent()?.navigate("Categories", { screen: "ProductList", params: { categoryId: cat.id, categoryName: cat.name } }), [navigation]);
  const openAllProducts = React.useCallback(() => {
    if (activeIds?.length > 1) {
      navigation.getParent()?.navigate("Categories", {
        screen: "ProductList",
        params: {
          title: activeLabel,
          categoryName: activeLabel,
          categoryIds: activeIds
        }
      });
      return;
    }
    const cat = activeCategory || filteredCategories[0] || categories[0];
    if (!cat) return;
    openCategory(cat);
  }, [activeCategory, activeIds, activeLabel, categories, filteredCategories, navigation, openCategory]);
  const openProductsSection = React.useCallback((title, sectionProducts) => {
    const sectionCategoryIds = [...new Set(sectionProducts.map((item) => item.category))];
    navigation.getParent()?.navigate("Categories", {
      screen: "ProductList",
      params: {
        title,
        categoryName: title,
        categoryIds: sectionCategoryIds,
        productIds: sectionProducts.map((item) => item.id)
      }
    });
  }, [navigation]);
  const openQuick = React.useCallback((product) => setQuickProduct(product), []);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.headerWrap}>
        <View style={styles.topRow}>
          <Pressable onPress={() => setLocationOpen(true)} style={styles.deliveryCopy}>
            <Text style={styles.brand}><Text style={styles.brandJust}>Just </Text><Text style={styles.brandHarvst}>Harvst</Text> in</Text>
            <View style={styles.timeRow}>
              <Text style={styles.time}>8 minutes</Text>
              <View style={styles.distanceChip}>
                <Text style={styles.distanceIcon}>▣</Text>
                <Text numberOfLines={1} style={styles.distanceText}>1.8 km away</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.addr}>
              {address ? `${address.label.toUpperCase()} - ${address.line1}` : "OTHER - add your delivery location"} ▾
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.getParent()?.getParent()?.navigate("Wallet")} style={styles.headerCircle}>
            <Ionicons name="wallet-outline" size={20} color="#9A6A08" />
            <Text style={styles.walletAmount}>₹0</Text>
          </Pressable>
          <Pressable onPress={() => navigation.getParent()?.navigate("Profile", { screen: "ProfileHome" })} style={styles.headerCircle}>
            <Feather name="user" size={20} color={colors.text} />
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.getParent()?.navigate("Search", { screen: "SearchHome" })} style={styles.search}>
          <Feather name="search" size={19} color={colors.text} />
          <Text numberOfLines={1} style={styles.searchText}>Search for atta, dal, coke and more</Text>
          <Text style={styles.mic}>🎙</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTabs}>
          {homeTabs.map((tab) => (
            <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={styles.quickTab}>
              <SafeRemoteImage uri={tab.iconUrl} style={styles.quickPhoto} fallback="▣" fallbackStyle={styles.quickIcon} />
              <Text style={[styles.quickLabel, activeTab === tab.id && styles.quickActive]}>{tab.label}</Text>
              {activeTab === tab.id ? <View style={styles.quickUnderline} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerRow}>
          {banners.map((banner) => (
            <View key={banner.id} style={[styles.banner, { backgroundColor: banner.color }]}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSub}>{banner.subtitle}</Text>
              <Text style={styles.bannerCta}>Shop now ›</Text>
            </View>
          ))}
        </ScrollView>
        <SectionHeader title={activeTab === "all" ? "All category" : activeLabel} />
        <View style={styles.catGrid}>
          {filteredCategories.map((cat) => (
            <Pressable key={cat.id} onPress={() => openCategory(cat)} style={styles.cat}>
              <View style={styles.catImage}><SafeRemoteImage uri={cat.iconUrl} style={styles.catPhoto} fallback="▣" fallbackStyle={styles.catIcon} /></View>
              <Text style={styles.catText}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Pressable onPress={() => dispatch(fetchCatalog())}><Text style={styles.errorText}>{error} Tap to retry.</Text></Pressable> : null}
        <View style={styles.greenBanner}>
          <Text style={styles.freeTitle}>{activeTab === "all" ? "LOWEST PRICE DEALS" : `${activeLabel} deals`}</Text>
          <Text style={styles.freeSub}>Curated grocery picks delivered fast</Text>
          <Text style={styles.freeButton}>Order now</Text>
        </View>
        <SkeletonRow />
        <ProductGridSection title={activeTab === "all" ? "Trending near you" : `Top ${activeLabel}`} products={filteredProducts.slice(0, 6)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        <ProductGridSection title="Top deals on bestsellers" products={filteredProducts.filter((item) => parseInt(item.discount, 10) >= 20).slice(0, 6)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        <ProductGridSection title="Recommended products" products={[...filteredProducts].reverse().slice(0, 6)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        {recent.length && activeTab === "all" ? <ProductGridSection title="Recently viewed" products={recent.slice(0, 6)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} /> : null}
      </ScrollView>
      <CommerceBottomStack navigation={navigation} bottomOffset={insets.bottom}/>
      <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
      <ProductQuickViewSheet
        visible={!!quickProduct}
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        onOpenFull={() => {
          const id = quickProduct?.id;
          setQuickProduct(null);
          if (id) goProduct(id);
        }}
      />
    </SafeAreaView>
  );
}

function ProductGridSection({ title, products, onPress, onViewDetails, onSeeAll }) {
  if (!products.length) return null;
  return (
    <View style={styles.rail}>
      <SectionHeader title={title} action="See All Products" onPress={() => onSeeAll(title, products)} />
      <View style={styles.productGrid}>
        {products.map((item) => (
          <ProductCard key={item.id} grid product={item} onPress={() => onPress(item.id)} onViewDetails={() => onViewDetails(item)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FB" },
  headerWrap: { backgroundColor: "#FFD35A", paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: "#E7C149" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  deliveryCopy: { flex: 1, minWidth: 0 },
  brand: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  brandJust: { color: "#000000" },
  brandHarvst: { color: "#2E7D32" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 },
  time: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  distanceChip: { maxWidth: 104, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FFF6CC", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  distanceIcon: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" },
  distanceText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900", flexShrink: 1 },
  addr: { color: colors.text, fontSize: type.subheading, marginTop: 1 },
  headerCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  headerCircleText: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  walletAmount: { color: colors.text, fontWeight: "900", fontSize: type.body, marginTop: -1 },
  search: { height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#E2DAC0", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 8 },
  searchText: { color: colors.muted, flex: 1, fontSize: type.heading },
  mic: { fontSize: type.heading },
  quickTabs: { gap: 16, paddingHorizontal: 2 },
  quickTab: { alignItems: "center", minWidth: 58, maxWidth: 102 },
  quickIcon: { fontSize: 18 },
  quickPhoto: { width: 22, height: 22, borderRadius: 11 },
  quickLabel: { color: colors.text, fontWeight: "700", marginTop: 2, fontSize: type.body, textAlign: "center" },
  quickActive: { fontWeight: "900" },
  quickUnderline: { height: 3, width: 38, borderRadius: 2, backgroundColor: colors.text, marginTop: 5 },
  content: { padding: 12, gap: 12, paddingBottom: bottomStackHeight },
  bannerRow: { gap: 8 },
  banner: { width: 220, minHeight: 90, borderRadius: 8, padding: 12, justifyContent: "center" },
  bannerTitle: { fontSize: type.heading, fontWeight: "900", color: colors.text, marginTop: 6 },
  bannerSub: { color: colors.muted, marginTop: 4, lineHeight: 15, fontSize: type.subheading },
  bannerCta: { marginTop: 10, color: colors.primaryDark, fontWeight: "900", fontSize: type.subheading },
  catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", columnGap: 6, rowGap: 8 },
  cat: { width: "23.5%", alignItems: "center" },
  catImage: { width: "100%", aspectRatio: 1.05, borderRadius: 8, backgroundColor: "#E7F5F2", alignItems: "center", justifyContent: "center" },
  catIcon: { fontSize: 34 },
  catPhoto: { width: "100%", height: "100%" },
  catText: { marginTop: 5, fontWeight: "600", color: colors.text, textAlign: "center", fontSize: 10, lineHeight: 14 },
  errorText: { color: colors.danger, fontSize: type.body, fontWeight: "800", textAlign: "center" },
  greenBanner: { minHeight: 116, borderRadius: 8, padding: 14, backgroundColor: "#48D66A", justifyContent: "center" },
  freeTitle: { color: "#4B210C", fontWeight: "900", fontSize: type.heading },
  freeSub: { color: "#4B210C", fontWeight: "800", marginTop: 4, textTransform: "uppercase", fontSize: type.body },
  freeButton: { marginTop: 12, alignSelf: "flex-start", backgroundColor: "#5B311B", color: "#fff", overflow: "hidden", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontWeight: "900", fontSize: type.body },
  rail: { gap: 8 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", columnGap: 8, rowGap: 8 }
});
