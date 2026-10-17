import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";
import NavratriSpecial from "../../components/NavratriSpecial";
import LocationSheet from "../../components/LocationSheet";
import ProductQuickViewSheet from "../../components/ProductQuickViewSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import CouponFeedbackModal from "../../components/CouponFeedbackModal";
import CommerceBottomStack from "../../components/CommerceBottomStack";
import UnlockFreeDeliveryBottomSheet from "../../components/UnlockFreeDeliveryBottomSheet";
import { FREE_DELIVERY_MIN, selectCartTotals, selectIsLoggedIn, selectSelectedAddress, selectVisibleWalletBalance } from "../../store/selectors";
import { fetchCatalog } from "../../store/slices/productSlice";
import { applyCoupon } from "../../store/slices/cartSlice";
import { coupons } from "../../data/mockData";
import { HOME_COLLECTIONS, SEASONAL_COLLECTIONS, EXPLORE_COLLECTIONS, productsForCollection, buyAgainProducts, featuredProducts, curatedProducts } from "../../services/homeCollections";
import { colors } from "../../theme/colors";
import useReducedMotion from "../../hooks/useReducedMotion";
import { HomeMotionContext, MotionPressable as Pressable, MotionEntrance, MotionVisibility } from "../../components/HomeMotion";

const categoryColors = ["#EAF5E9", "#FFF1DE", "#EDF1FF", "#FFF6DC", "#FCECEC", "#F1EDFA"];
const banners = [
  { id: "fresh", eyebrow: "FROM THE FRESH AISLE", title: "Fresh picks.\nHappy kitchens.", subtitle: "Fruits & veggies for your everyday", color: "#EAF5E9", accent: "#235C35", emoji: "🥬", match: /fruit|vegetable|apple|banana|mango|tomato/i },
  { id: "pantry", eyebrow: "YOUR DAILY FAVOURITES", title: "A little pantry\nrestock?", subtitle: "All your kitchen staples, sorted", color: "#FFF0DC", accent: "#844A23", emoji: "🛍️", match: /atta|rice|dal|daal|flour|oil|pantry/i }
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const reducedMotion = useReducedMotion();
  const scrollRef = React.useRef(null);
  const scrollOffset = React.useRef(0);
  const scrollAnimation = React.useRef(null);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [offersOpen, setOffersOpen] = React.useState(false);
  const [couponFeedback, setCouponFeedback] = React.useState(null);
  const [quickProduct, setQuickProduct] = React.useState(null);
  const [dockHeight, setDockHeight] = React.useState(76);
  const cancelScrollAnimation = React.useCallback(() => {
    if (scrollAnimation.current !== null) {
      cancelAnimationFrame(scrollAnimation.current);
      scrollAnimation.current = null;
    }
  }, []);
  React.useEffect(() => cancelScrollAnimation, [cancelScrollAnimation]);
  React.useEffect(() => { if (reducedMotion !== false) cancelScrollAnimation(); }, [reducedMotion, cancelScrollAnimation]);
  const scrollToTop = React.useCallback(() => {
    cancelScrollAnimation();
    const startOffset = Math.max(0, scrollOffset.current);
    if (!startOffset) return;
    if (reducedMotion !== false) {
      scrollOffset.current = 0;
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    const duration = Math.min(1000, Math.max(650, startOffset * 0.15));
    let startedAt;
    const step = (timestamp) => {
      if (startedAt === undefined) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      // Ease out gently as the header comes back into view.
      const y = startOffset * Math.pow(1 - progress, 3);
      scrollOffset.current = y;
      scrollRef.current?.scrollTo({ y, animated: false });
      scrollAnimation.current = progress < 1 ? requestAnimationFrame(step) : null;
    };
    scrollAnimation.current = requestAnimationFrame(step);
  }, [cancelScrollAnimation, reducedMotion]);
  const handleScroll = React.useCallback((event) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
    const visible = scrollOffset.current > 320;
    if (visible !== showBackToTop) setShowBackToTop(visible);
  }, [showBackToTop]);
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const recentIds = useSelector((state) => state.products.recentlyViewed);
  const orders = useSelector((state) => state.orders.items);
  const mobile = useSelector((state) => state.auth.mobile);
  const wishlistIds = useSelector((state) => state.wishlist.ids);
  const activeCoupon = useSelector((state) => state.cart.coupon);
  const address = useSelector(selectSelectedAddress);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const walletBalance = useSelector(selectVisibleWalletBalance);
  const totals = useSelector(selectCartTotals);
  const remaining = Math.max(FREE_DELIVERY_MIN - totals.subtotal, 0);
  const recent = React.useMemo(() => recentIds.map((id) => products.find((item) => item.id === id)).filter(Boolean), [products, recentIds]);
  const purchased = React.useMemo(() => buyAgainProducts(products, orders, mobile, isLoggedIn), [products, orders, mobile, isLoggedIn]);
  const featured = React.useMemo(() => featuredProducts(products), [products]);
  const curated = React.useMemo(() => curatedProducts(products, recent, purchased, wishlistIds), [products, recent, purchased, wishlistIds]);
  const collections = React.useMemo(() => HOME_COLLECTIONS.map((collection) => ({ ...collection, products: productsForCollection(products, categories, collection.match) })), [products, categories]);
  const seasonal = React.useMemo(() => SEASONAL_COLLECTIONS.map((collection) => {
    const matches = productsForCollection(products, categories, collection.match);
    const tagged = matches.filter((product) => (product.tags || []).some((tag) => /\b(seasonal|in[ -]season)\b/i.test(tag)));
    return { ...collection, products: tagged.length ? tagged : matches };
  }), [products, categories]);
  const explore = React.useMemo(() => EXPLORE_COLLECTIONS.map((collection) => ({ ...collection, products: productsForCollection(products, categories, collection.match) })), [products, categories]);
  const goProduct = React.useCallback((id) => navigation.navigate("ProductDetails", { productId: id }), [navigation]);
  const homeTabs = React.useMemo(() => [{ id: "all", label: "All", iconUrl: null }, ...categories.map((cat) => ({ id: cat.id, label: cat.name, iconUrl: cat.iconUrl }))], [categories]);
  const openCategory = React.useCallback((cat) => navigation.getParent()?.navigate("Categories", { screen: "ProductList", params: { categoryId: cat.id, categoryName: cat.name } }), [navigation]);
  const openCategories = () => navigation.getParent()?.navigate("Categories", { screen: "CategoryHome" });
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
  const openOffers = () => navigation.getParent()?.getParent()?.navigate("Offers");
  const useCoupon = (coupon) => {
    if (totals.subtotal < coupon.min) {
      setCouponFeedback({ type: "unavailable", coupon, remaining: coupon.min - totals.subtotal });
      return;
    }
    dispatch(applyCoupon(coupon));
    setCouponFeedback({ type: "success", coupon });
  };

  return (
    <HomeMotionContext.Provider value={reducedMotion}>
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(dockHeight, 76) + 76 }}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={cancelScrollAnimation}
        onTouchStart={cancelScrollAnimation}
        scrollEventThrottle={32}
      >
      <View style={styles.headerWrap}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <Image source={require("../../../assets/just-harvst-logo.png")} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Just Harvst" />
          </View>
          {isLoggedIn ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Open wallet" onPress={() => navigation.getParent()?.getParent()?.navigate("Wallet")} style={styles.headerCircle}>
              <Ionicons name="wallet-outline" size={19} color="#0D7163" />
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.walletAmount}>₹{walletBalance}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigation.getParent()?.navigate("Profile", { screen: "ProfileHome" })} style={styles.headerCircle}>
            <Feather name="user" size={21} color="#0D7163" />
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose delivery location" onPress={() => setLocationOpen(true)} style={styles.deliveryPanel}>
          <View style={styles.deliveryMark}><Feather name="truck" size={20} color="#FFFFFF" /></View>
          <View style={styles.deliveryCopy}>
            <View style={styles.timeRow}>
              <Text style={styles.deliveryLabel}>Delivery in</Text>
              <Text style={styles.time}>8 minutes</Text>
            </View>
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={12} color="#47736A" />
              <Text numberOfLines={1} style={styles.addr}>{address ? `${address.label} · ${address.line1}` : "Select your delivery location"}</Text>
            </View>
          </View>
          <Feather name="chevron-down" size={17} color="#0D7163" />
        </Pressable>
      </View>
      <View style={styles.searchWrap}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search groceries" onPress={() => navigation.getParent()?.navigate("Search", { screen: "SearchHome" })} style={styles.search}>
          <Feather name="search" size={20} color="#253228" />
          <Text numberOfLines={1} style={styles.searchText}>Search for “milk, atta, fruits”</Text>
          <View style={styles.searchDivider} />
          <Pressable accessibilityRole="button" accessibilityLabel="Speak to search" hitSlop={6} onPress={(event) => {
            event.stopPropagation();
            navigation.getParent()?.navigate("Search", { screen: "SearchHome", params: { voiceSearch: true } });
          }} style={{ padding: 6 }}><Feather name="mic" size={18} color="#0D7163" /></Pressable>
        </Pressable>
      </View>
      <View style={styles.headerTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTabs}>
          {homeTabs.map((tab, index) => (
            <Pressable key={tab.id} accessibilityRole="button" accessibilityLabel={`Shop ${tab.label}`} onPress={() => { if (tab.id !== "all") openCategory({ id: tab.id, name: tab.label }); }} style={styles.quickTab}>
              <MotionEntrance delay={Math.min(index * 30, 150)} style={[styles.quickImageWrap, tab.id === "all" && styles.quickImageActive]}>
                {tab.id === "all" ? <Text style={styles.groceryIcon}>🛒</Text> : <SafeRemoteImage uri={tab.iconUrl} style={styles.quickPhoto} resizeMode="contain" fallbackStyle={styles.quickIcon} />}
              </MotionEntrance>
              <Text numberOfLines={1} style={[styles.quickLabel, tab.id === "all" && styles.quickActive]}>{tab.label}</Text>
              {tab.id === "all" ? <View style={styles.quickUnderline} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <MotionEntrance delay={60}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerRow} snapToInterval={294} decelerationRate="fast">
          {banners.map((banner) => {
            const matches = products.filter((item) => banner.match.test(`${item.name} ${item.categoryName} ${item.subCategory}`));
            const heroProduct = matches[0];
            return (
              <Pressable key={banner.id} accessibilityRole="button" accessibilityLabel={`Shop ${banner.id === "fresh" ? "fresh produce" : "pantry essentials"}`} onPress={() => openProductsSection(banner.id === "fresh" ? "Fresh picks" : "Pantry essentials", matches.length ? matches : products)} style={[styles.banner, { backgroundColor: banner.color }]}>
                <View style={styles.bannerCopy}>
                  <Text style={[styles.bannerEyebrow, { color: banner.accent }]}>{banner.eyebrow}</Text>
                  <Text style={[styles.bannerTitle, { color: banner.accent }]}>{banner.title}</Text>
                  <Text style={styles.bannerSub}>{banner.subtitle}</Text>
                  <View style={[styles.bannerButton, { backgroundColor: banner.accent }]}><Text style={styles.bannerCta}>Shop now</Text><Feather name="arrow-right" size={13} color="#FFFFFF" /></View>
                </View>
                <View style={styles.bannerArt}><SafeRemoteImage uri={heroProduct?.imageGallery?.[0] || heroProduct?.image} style={styles.bannerPhoto} resizeMode="contain" fallback={banner.emoji} fallbackStyle={styles.bannerEmoji} /></View>
              </Pressable>
            );
          })}
        </ScrollView>
        </MotionEntrance>

        <View style={styles.categorySection}>
          <HomeSectionHeading title="Shop by category" subtitle="Your everyday essentials, all here" onPress={openCategories} />
          <View style={styles.catGrid}>
            {categories.map((cat, index) => (
              <Pressable key={cat.id} accessibilityRole="button" accessibilityLabel={`Shop ${cat.name}`} onPress={() => openCategory(cat)} style={styles.cat}>
                <MotionEntrance delay={Math.min(index * 30, 150)} style={[styles.catImage, { backgroundColor: categoryColors[index % categoryColors.length] }]}><SafeRemoteImage uri={cat.iconUrl} style={styles.catPhoto} resizeMode="contain" fallbackStyle={styles.catIcon} /></MotionEntrance>
                <Text numberOfLines={2} style={styles.catText}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
        {error ? <Pressable onPress={() => dispatch(fetchCatalog())} style={styles.errorBox}><Text style={styles.errorText}>{error} Tap to retry.</Text></Pressable> : null}

        <View style={styles.rail}>
          <HomeSectionHeading title="Explore" subtitle="A little inspiration for your next basket" onPress={openCategories} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreRail}>
            {explore.map((collection) => (
              <Pressable key={collection.title} accessibilityRole="button" accessibilityLabel={`Explore ${collection.title}`} disabled={!collection.products.length} onPress={() => openProductsSection(collection.title, collection.products)} style={[styles.exploreCard, { backgroundColor: collection.color }]}>
                <View style={styles.exploreImage}><SafeRemoteImage uri={collection.products[0]?.imageGallery?.[0] || collection.products[0]?.image} style={styles.explorePhoto} resizeMode="contain" fallback={collection.emoji} fallbackStyle={styles.exploreEmoji} /></View>
                <Text style={styles.exploreTitle}>{collection.title}</Text>
                <Text style={styles.exploreSubtitle}>{collection.subtitle}</Text>
                <View style={styles.exploreAction}><Text style={styles.exploreActionText}>{collection.products.length ? "Explore picks" : "Coming soon"}</Text>{collection.products.length ? <Feather name="arrow-right" size={12} color="#315C3C" /> : null}</View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.seasonalSection}><NavratriSpecial products={products} categories={categories} onShop={openProductsSection} /></View>
        <ProductGridSection title="Featured" subtitle="Standout picks for your everyday" products={featured} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty emptyEmoji="✨" />
        <ProductGridSection title="Trending near you" subtitle="The neighbourhood favourites" products={products.slice(0, 8)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        {seasonal.map((collection) => <ProductGridSection key={collection.title} {...collection} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty onExplore={openCategories} />)}

        <Pressable accessibilityRole="button" accessibilityLabel="View delivery offers" onPress={() => setOffersOpen(true)} style={styles.deliveryBanner}>
          <View style={styles.deliveryIcon}><Feather name="truck" size={23} color="#277344" /></View>
          <View style={styles.deliveryBannerCopy}><Text style={styles.deliveryTitle}>{remaining ? "A little more. Free delivery." : "You've unlocked free delivery!"}</Text><Text style={styles.deliverySubtitle}>{remaining ? `Add ₹${remaining} more to unlock free delivery` : "Your next basket comes with a little extra joy"}</Text></View>
          <Feather name="chevron-right" size={18} color="#277344" />
        </Pressable>

        <View style={styles.couponsSection}>
          <View style={styles.couponHeading}>
            <View style={styles.couponHeadingBadge}><Ionicons name="settings-sharp" size={28} color="#0CAE58" /><View style={styles.couponBadgeIcon}><Feather name="percent" size={14} color="#FFFFFF" /></View></View>
            <Text accessibilityRole="header" style={styles.couponHeadingTitle}>Coupons & Offers</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="View all offers" onPress={openOffers} style={styles.couponViewAll}><Text style={styles.couponViewAllText}>View all</Text><Feather name="chevron-right" size={13} color="#185439" /></Pressable>
          </View>
          <View style={styles.couponRail}>
            {coupons.map((coupon, index) => {
              const applied = activeCoupon?.id === coupon.id;
              const warm = index % 2 === 1;
              return (
                <Pressable key={coupon.id} accessibilityRole="button" accessibilityLabel={`${applied ? "Applied" : "Apply"} coupon ${coupon.title}`} accessibilityHint={`₹${coupon.discount} off on orders of ₹${coupon.min} or more`} disabled={applied} onPress={() => useCoupon(coupon)} style={[styles.couponCard, warm && styles.couponCardWarm, applied && styles.couponApplied]}>
                  <View pointerEvents="none" style={[styles.couponGlow, warm && styles.couponGlowWarm]} />
                  <Image source={warm ? require("../../../assets/coupon-grocery-bag.png") : require("../../../assets/coupon-grocery-basket.png")} style={styles.couponArt} resizeMode="contain" accessibilityIgnoresInvertColors />
                  <View style={[styles.couponFlatPill, warm && styles.couponFlatPillWarm]}><Text style={styles.couponFlat}>{applied ? "APPLIED ✓" : "FLAT"}</Text></View>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.couponSavings, warm && styles.couponSavingsWarm]}>₹{coupon.discount} OFF</Text>
                  <Text style={styles.couponTerms}>On orders of ₹{coupon.min}+</Text>
                  <View style={styles.couponCodePanel}>
                    <View style={styles.couponCodeCopy}><Text style={styles.couponCodeLabel}>{applied ? "Applied" : "Use code"}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.couponCode, warm && styles.couponCodeWarm]}>{coupon.title}</Text></View>
                    <Feather name={applied ? "check-circle" : "arrow-right-circle"} size={17} color={warm ? "#A84717" : "#165B35"} />
                  </View>
                  <View pointerEvents="none" style={styles.couponPerforation}>{Array.from({ length: 22 }, (_, dot) => <View key={dot} style={styles.couponPerforationDot} />)}</View>
                  <View pointerEvents="none" style={styles.couponNotchLeft} /><View pointerEvents="none" style={styles.couponNotchRight} />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.offerTicketRail}>
            <Pressable accessibilityRole="button" accessibilityLabel="View free delivery offer" onPress={() => setOffersOpen(true)} style={styles.offerTicket}>
              <View style={styles.ticketIcon}><Feather name="truck" size={23} color="#00964B" /></View>
              <View style={styles.ticketCopy}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.ticketTitle}>{remaining ? "Get free delivery" : "Free delivery unlocked!"}</Text><Text numberOfLines={2} style={styles.ticketSubtitle}>On orders of ₹{FREE_DELIVERY_MIN}+</Text></View>
              <Feather name="chevron-right" size={17} color="#24535B" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="View all coupons and offers" onPress={openOffers} style={[styles.offerTicket, styles.offerTicketPurple]}>
              <View style={[styles.ticketIcon, styles.ticketSavingsIcon]}><Feather name="tag" size={23} color="#7B27E5" /></View>
              <View style={styles.ticketCopy}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.ticketTitle, styles.ticketTitlePurple]}>More offers for you</Text><Text numberOfLines={2} style={styles.ticketSubtitle}>Save on everyday essentials</Text></View>
              <Feather name="chevron-right" size={17} color="#63428D" />
            </Pressable>
          </View>
        </View>

        <ProductGridSection title="Buy Again" subtitle="Your past favourites, ready for another round" products={purchased} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty emptyEmoji="🛍️" emptyMessage="Your previous purchases will appear here after your first order." onExplore={openCategories} />
        <ProductGridSection {...collections[0]} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty onExplore={openCategories} />
        <ProductGridSection title="Curated for you" subtitle={recent.length || purchased.length || wishlistIds.length ? "Inspired by the things you love" : "Fresh inspiration for your next basket"} products={curated} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty emptyEmoji="💚" />
        {collections.slice(1).map((collection) => <ProductGridSection key={collection.title} {...collection} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} showEmpty onExplore={openCategories} />)}

        <ProductGridSection title="Big on savings" subtitle="Good finds. Even better prices." products={products.filter((item) => parseInt(item.discount, 10) >= 20).slice(0, 8)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        <ProductGridSection title="Picked for your pantry" subtitle="Make room for your daily favourites" products={[...products].reverse().slice(0, 8)} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} />
        {recent.length > 0 ? <ProductGridSection title="Take another look" subtitle="Your recently viewed picks" products={recent} onPress={goProduct} onViewDetails={openQuick} onSeeAll={openProductsSection} /> : null}
        <View style={styles.footer}><Text style={styles.footerTitle}>{"Fresh groceries.\nHappy everyday."}</Text><Text style={styles.footerSubtitle}>A little freshness from Just Harvst 🌿</Text></View>
      </View>
      </ScrollView>
      <MotionVisibility visible={showBackToTop} style={[styles.backToTopPosition, { bottom: Math.max(dockHeight, 76) + 20 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to top"
          accessibilityHint="Scrolls to the top of the home page"
          onPress={scrollToTop}
          style={styles.backToTop}
        >
          <Feather name="arrow-up" size={23} color="#FFFFFF" />
        </Pressable>
      </MotionVisibility>
      <CommerceBottomStack navigation={navigation} onHeightChange={setDockHeight} />
      <UnlockFreeDeliveryBottomSheet visible={offersOpen} onClose={() => setOffersOpen(false)} subtotal={totals.subtotal} />
      <CouponFeedbackModal feedback={couponFeedback} onClose={() => setCouponFeedback(null)} buttonLabel="Keep shopping" />
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
    </HomeMotionContext.Provider>
  );
}

function HomeSectionHeading({ title, subtitle, onPress }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionCopy}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>
      {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`See all ${title}`} onPress={onPress} hitSlop={8} style={styles.seeAll}><Text style={styles.seeAllText}>See all</Text><Feather name="arrow-right" size={13} color="#237344" /></Pressable> : null}
    </View>
  );
}

function ProductGridSection({ title, subtitle, products, onPress, onViewDetails, onSeeAll, showEmpty = false, emoji, emptyEmoji, emptyMessage, onExplore }) {
  if (!products.length && !showEmpty) return null;
  return (
    <View style={styles.rail}>
      <HomeSectionHeading title={title} subtitle={subtitle} onPress={products.length ? () => onSeeAll(title, products) : undefined} />
      {products.length ? <ScrollView horizontal style={styles.productScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRail}>
        {products.slice(0, 8).map((item) => <ProductCard key={item.id} home product={item} onPress={() => onPress(item.id)} onViewDetails={() => onViewDetails(item)} />)}
      </ScrollView> : <View style={styles.emptyShelf}><Text style={styles.emptyEmoji}>{emptyEmoji || emoji || "🛒"}</Text><View style={styles.emptyCopy}><Text style={styles.emptyText}>{emptyMessage || "No products available in this collection right now."}</Text>{onExplore ? <Pressable accessibilityRole="button" onPress={onExplore} hitSlop={8}><Text style={styles.emptyAction}>Explore other essentials ›</Text></Pressable> : null}</View></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: "relative", backgroundColor: "#FFFFFF" },
  headerWrap: { backgroundColor: "#F7FBF9", paddingTop: 2 },
  searchWrap: { backgroundColor: "#F7FBF9", borderBottomWidth: 1, borderBottomColor: "#DFEBE6" },
  headerTabs: { backgroundColor: "#F7FBF9", paddingTop: 12, borderBottomWidth: 1, borderBottomColor: "#DFEBE6" },
  backToTopPosition: { position: "absolute", right: 18, zIndex: 45 },
  backToTop: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#0D7163", borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#073E35", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  brand: { flex: 1, minWidth: 0 },
  brandLogo: { width: 108, height: 56 },
  deliveryPanel: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 15, backgroundColor: "#E5F2EC", borderWidth: 1, borderColor: "#D6E9DF" },
  deliveryMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#0D7163", alignItems: "center", justifyContent: "center" },
  deliveryCopy: { flex: 1, minWidth: 0 },
  timeRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 5 },
  deliveryLabel: { color: "#315F53", fontSize: 12, fontWeight: "500" },
  time: { fontSize: 20, letterSpacing: -0.5, fontWeight: "800", color: "#0B5144" },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  addr: { color: "#47736A", fontSize: 11, flexShrink: 1 },
  headerCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#DFEBE6" },
  walletAmount: { color: "#0D7163", fontWeight: "800", fontSize: 9 },
  search: { height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 9, marginHorizontal: 16, marginTop: 12, marginBottom: 14, borderWidth: 1, borderColor: "#D5E5DC" },
  searchText: { color: "#78877F", flex: 1, fontSize: 13 },
  searchDivider: { height: 20, width: 1, backgroundColor: "#E2EBE6" },
  quickTabs: { gap: 14, paddingHorizontal: 16 },
  quickTab: { alignItems: "center", width: 62, paddingBottom: 12, position: "relative" },
  quickImageWrap: { width: 42, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  quickImageActive: { backgroundColor: "#DDEFE5", borderWidth: 1, borderColor: "#C5E1D2" },
  quickIcon: { fontSize: 25 },
  groceryIcon: { fontSize: 29 },
  quickPhoto: { width: 36, height: 36, borderRadius: 10 },
  quickLabel: { color: "#63786D", fontWeight: "600", marginTop: 5, fontSize: 10, textAlign: "center" },
  quickActive: { fontWeight: "800", color: "#0D7163" },
  quickUnderline: { position: "absolute", bottom: 0, height: 3, width: 32, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: "#0D7163" },
  scroll: { flex: 1 },
  content: { paddingTop: 18, gap: 25 },
  bannerRow: { gap: 12, paddingHorizontal: 16 },
  banner: { width: 282, minHeight: 166, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  bannerCopy: { flex: 1, zIndex: 1 },
  bannerEyebrow: { fontSize: 8, letterSpacing: 0.9, fontWeight: "800" },
  bannerTitle: { fontSize: 23, fontWeight: "900", letterSpacing: -0.7, lineHeight: 26, marginTop: 7 },
  bannerSub: { color: "#687260", marginTop: 7, fontSize: 10, lineHeight: 14, maxWidth: 155 },
  bannerButton: { marginTop: 12, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8 },
  bannerCta: { color: "#FFFFFF", fontWeight: "800", fontSize: 10 },
  bannerArt: { width: 86, height: 110, borderRadius: 44, backgroundColor: "rgba(255,255,255,0.5)", justifyContent: "center" },
  bannerPhoto: { width: 86, height: 100, borderRadius: 30 },
  bannerEmoji: { fontSize: 52 },
  categorySection: { gap: 15 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, paddingHorizontal: 16 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#202C24", letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 11, color: "#8A9189", marginTop: 4 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 36 },
  seeAllText: { fontSize: 11, color: "#237344", fontWeight: "800" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", paddingHorizontal: 16, columnGap: 8, rowGap: 16 },
  cat: { width: "22.5%", alignItems: "center" },
  catImage: { width: "100%", aspectRatio: 1, borderRadius: 17, alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 5 },
  catIcon: { fontSize: 32 },
  catPhoto: { width: "100%", height: "100%", borderRadius: 13 },
  catText: { marginTop: 8, fontWeight: "600", color: "#3A423A", textAlign: "center", fontSize: 10, lineHeight: 14, minHeight: 28 },
  loading: { paddingVertical: 10 },
  errorBox: { marginHorizontal: 16, padding: 12, backgroundColor: "#FFF0EF", borderRadius: 12 },
  errorText: { color: colors.danger, fontSize: 12, textAlign: "center" },
  seasonalSection: { paddingHorizontal: 16 },
  rail: { gap: 14 },
  exploreRail: { paddingHorizontal: 16, gap: 12, paddingBottom: 2 },
  exploreCard: { width: 150, padding: 13, borderRadius: 18 },
  exploreImage: { height: 80, marginBottom: 10 },
  explorePhoto: { width: "100%", height: "100%", borderRadius: 14 },
  exploreEmoji: { fontSize: 45 },
  exploreTitle: { color: "#293C2C", fontSize: 14, fontWeight: "800" },
  exploreSubtitle: { color: "#75816E", fontSize: 10, marginTop: 4, lineHeight: 14 },
  exploreAction: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  exploreActionText: { color: "#315C3C", fontSize: 10, fontWeight: "800" },
  couponsSection: { backgroundColor: "#FFFFFF", gap: 14, paddingTop: 8, paddingBottom: 4 },
  couponHeading: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 16 },
  couponHeadingBadge: { width: 28, height: 30, alignItems: "center", justifyContent: "center" },
  couponBadgeIcon: { position: "absolute", alignItems: "center", justifyContent: "center" },
  couponHeadingTitle: { flex: 1, color: "#102E20", fontSize: 19, fontWeight: "900", letterSpacing: -0.7 },
  couponViewAll: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#E9F7EF", paddingHorizontal: 9, paddingVertical: 8, borderRadius: 18 },
  couponViewAllText: { color: "#185439", fontSize: 10, fontWeight: "800" },
  couponRail: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  couponCard: { flexGrow: 1, flexBasis: "45%", minWidth: 130, height: 100, borderRadius: 13, borderWidth: 1, borderColor: "#DBF0D1", backgroundColor: "#D9F7C9", padding: 8, overflow: "hidden", position: "relative" },
  couponCardWarm: { backgroundColor: "#FFF0C9", borderColor: "#F7E5B4" },
  couponApplied: { borderColor: "#20994F", borderWidth: 2 },
  couponGlow: { position: "absolute", width: 170, height: 170, borderRadius: 85, top: -55, left: -35, backgroundColor: "#EEFFE6" },
  couponGlowWarm: { backgroundColor: "#FFFAE8" },
  couponArt: { position: "absolute", width: "50%", height: 90, right: -9, bottom: 0 },
  couponFlatPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#08AF55", borderRadius: 15 },
  couponFlatPillWarm: { backgroundColor: "#FF7412" },
  couponFlat: { color: "#FFFFFF", fontSize: 8, letterSpacing: 0.7, fontWeight: "800" },
  couponSavings: { color: "#082F18", fontSize: 21, lineHeight: 24, fontWeight: "900", marginTop: 2, letterSpacing: -1.1, maxWidth: "85%" },
  couponSavingsWarm: { color: "#632108" },
  couponTerms: { color: "#52634B", fontSize: 8, lineHeight: 10, marginTop: 1, maxWidth: "70%" },
  couponCodePanel: { position: "absolute", left: 8, bottom: 7, width: "70%", minHeight: 28, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.96)" },
  couponCodeCopy: { flex: 1, minWidth: 0 },
  couponCodeLabel: { color: "#7A837A", fontSize: 6, marginBottom: 1 },
  couponCode: { color: "#17603A", fontSize: 11, fontWeight: "900" },
  couponCodeWarm: { color: "#D95008" },
  couponPerforation: { position: "absolute", bottom: -3, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around" },
  couponPerforationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  couponNotchLeft: { position: "absolute", left: -4, bottom: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  couponNotchRight: { position: "absolute", right: -4, bottom: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  offerTicketRail: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  offerTicket: { flexGrow: 1, flexBasis: "45%", minWidth: 130, height: 51, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EDF8F7", borderWidth: 1, borderColor: "#D8EEEB", borderRadius: 12, paddingHorizontal: 7, paddingVertical: 6 },
  offerTicketPurple: { backgroundColor: "#F3EFFF", borderColor: "#E7DEFA" },
  ticketIcon: { width: 28, height: 30, borderRadius: 9, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  ticketSavingsIcon: { backgroundColor: "#FCFAFF" },
  ticketCopy: { flex: 1, minWidth: 0 },
  ticketTitle: { color: "#173B36", fontSize: 10, lineHeight: 13, fontWeight: "800" },
  ticketTitlePurple: { color: "#33215E" },
  ticketSubtitle: { color: "#7A8986", fontSize: 8, marginTop: 3, lineHeight: 10 },
  emptyShelf: { marginHorizontal: 16, borderRadius: 14, padding: 15, backgroundColor: "#F8FAF5", borderWidth: 1, borderColor: "#EBEFE6", flexDirection: "row", alignItems: "center", gap: 13 },
  emptyEmoji: { fontSize: 29 },
  emptyCopy: { flex: 1 },
  emptyText: { color: "#8A9182", fontSize: 11, lineHeight: 16 },
  emptyAction: { color: "#237344", fontSize: 11, fontWeight: "700", marginTop: 7 },
  productScroll: { flexGrow: 0, flexShrink: 0 },
  productRail: { alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingBottom: 5 },
  deliveryBanner: { marginHorizontal: 16, padding: 14, backgroundColor: "#F0F7EF", borderRadius: 14, borderWidth: 1, borderColor: "#DBEBD8", flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryIcon: { width: 39, height: 39, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#DFEDD9" },
  deliveryBannerCopy: { flex: 1 },
  deliveryTitle: { color: "#2D5135", fontSize: 12, fontWeight: "800" },
  deliverySubtitle: { color: "#758572", fontSize: 10, marginTop: 4, lineHeight: 14 },
  footer: { paddingHorizontal: 22, paddingTop: 9, paddingBottom: 6 },
  footerTitle: { color: "#C4CDC1", fontSize: 32, lineHeight: 36, fontWeight: "900", letterSpacing: -1.2 },
  footerSubtitle: { color: "#959E91", fontSize: 11, marginTop: 11 },

});
