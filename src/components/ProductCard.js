import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decrementCart } from "../store/slices/cartSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import { applyVariant } from "../services/catalogApi";
import SafeRemoteImage from "./SafeRemoteImage";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

function ProductCard({ product, onPress, compact = false, grid = false, railGrid = false, home = false, onViewDetails }) {
  const dispatch = useDispatch();
  const [variantIndex, setVariantIndex] = React.useState(0);
  const variants = product.variants || product.productVariantList || [];
  const activeVariant = variants[variantIndex] || product.selectedVariant;
  const displayProduct = React.useMemo(() => applyVariant(product, activeVariant), [activeVariant, product]);
  const cartPayload = activeVariant ? { productId: product.id, unit: activeVariant } : product.id;
  const cartKey = activeVariant ? `${product.id}::${activeVariant.label}` : product.id;
  const qty = useSelector((state) => state.cart.items[cartKey] || state.cart.items[product.id] || 0);
  const wished = useSelector((state) => state.wishlist.ids.includes(product.id));
  const shareProduct = () => Share.share({ message: `${displayProduct.name} is available on Just Harvst for ₹${displayProduct.price}` });
  const nextVariant = () => {
    if (variants.length > 1) setVariantIndex((current) => (current + 1) % variants.length);
  };
  const gallery = displayProduct.imageGallery?.length ? displayProduct.imageGallery : product.imageGallery || [];
  const [imageIndex, setImageIndex] = React.useState(0);
  const activeImage = gallery[imageIndex] || displayProduct.image;
  const discountValue = parseInt(displayProduct.discount, 10);
  const hasDiscount = Number.isFinite(discountValue) && discountValue > 0;

  React.useEffect(() => {
    setImageIndex(0);
  }, [product.id, variantIndex]);

  React.useEffect(() => {
    if (gallery.length <= 1) return undefined;
    const timer = setInterval(() => {
      setImageIndex((current) => (current + 1) % gallery.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [gallery.length]);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${displayProduct.name}`} style={[styles.card, compact && styles.compact, grid && styles.gridCard, railGrid && styles.railGridCard, home && styles.homeCard]}>
      <View style={[styles.imageWrap, home && styles.homeImageWrap]}>
        {hasDiscount ? (
          <View style={[styles.discountBadge, home && styles.homeDiscountBadge]}>
            <Text numberOfLines={1} style={[styles.discountBadgeText, home && styles.homeDiscountText]}>{displayProduct.discount} OFF</Text>
          </View>
        ) : null}
        <View style={styles.overlayColumn}>
          <Pressable onPress={() => dispatch(toggleWishlist(product.id))} style={styles.iconButton}>
            <Ionicons name={wished ? "heart" : "heart-outline"} size={15} color={wished ? colors.danger : colors.muted} />
          </Pressable>
          {!home ? <Pressable onPress={shareProduct} style={styles.iconButton}>
            <Feather name="share-2" size={13} color={colors.muted} />
          </Pressable> : null}
        </View>
        <SafeRemoteImage uri={activeImage} style={styles.photo} resizeMode={home ? "contain" : "cover"} fallback={displayProduct.image} fallbackStyle={styles.image} />
        {qty ? (
          <View style={[styles.stepper, home && styles.homeStepper]}>
            <Pressable onPress={() => dispatch(decrementCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></Pressable>
            <Text style={styles.stepQty}>{qty}</Text>
            <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`Add ${displayProduct.name} to cart`} onPress={() => dispatch(addToCart(cartPayload))} style={[styles.addCircle, home && styles.homeAdd]}>
            <Text style={[styles.addPlus, home && styles.homeAddText]}>{home ? "ADD" : "+"}</Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={nextVariant} disabled={variants.length <= 1} style={[styles.qtyWrap, home && styles.homeQtyWrap]}>
        <Text numberOfLines={1} style={[styles.qty, home && styles.homeQty]}>{displayProduct.quantity}{variants.length > 1 ? " ▾" : ""}</Text>
      </Pressable>
      <Text numberOfLines={home ? 2 : undefined} style={[styles.name, home && styles.homeName]}>{displayProduct.name}</Text>
      <View style={[styles.priceRow, home && styles.homePriceRow]}>
        <Text numberOfLines={1} style={[styles.price, home && styles.homePrice]}>₹{displayProduct.price}</Text>
        {(!home || displayProduct.mrp > displayProduct.price) ? <Text numberOfLines={1} style={styles.mrp}>₹{displayProduct.mrp}</Text> : null}
      </View>
      <Text style={[styles.meta, home && styles.homeMeta]}>{home ? `◷ 8–15 mins${displayProduct.rating > 0 ? ` • ★ ${displayProduct.rating}` : ""}` : `◷ 15 mins • ★ ${displayProduct.rating}`}</Text>
    </Pressable>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    width: 118,
    backgroundColor: "transparent",
    borderRadius: 12,
    gap: 4
  },
  compact: { width: "48%" },
  gridCard: { width: "31.7%" },
  railGridCard: { width: "47.5%" },
  imageWrap: { height: 106, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F6FA", borderRadius: 12, overflow: "visible" },
  photo: { width: "100%", height: "100%", borderRadius: 12 },
  overlayColumn: { position: "absolute", top: 5, right: 5, zIndex: 2, gap: 5 },
  iconButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.96)", alignItems: "center", justifyContent: "center" },
  discountBadge: { position: "absolute", top: 6, left: 6, zIndex: 2, maxWidth: 72, minHeight: 22, borderRadius: 11, backgroundColor: colors.primary, paddingHorizontal: 7, alignItems: "center", justifyContent: "center" },
  discountBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  image: { fontSize: 40 },
  qtyWrap: { minWidth: 0 },
  qty: { color: colors.text, fontSize: type.body, fontWeight: "900" },
  name: {  color: colors.info, fontWeight: "900", fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 3, minWidth: 0 },
  price: { color: colors.text, fontWeight: "600", fontSize: type.subheading, flexShrink: 0 },
  mrp: { color: colors.muted, textDecorationLine: "line-through", fontSize: type.body, flexShrink: 1 },
  addCircle: { position: "absolute", right: -3, bottom: -10, zIndex: 3, width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.68)", alignItems: "center", justifyContent: "center" },
  addPlus: { color: "#fff", fontSize: 24, lineHeight: 26, fontWeight: "900" },
  stepper: { position: "absolute", right: -3, bottom: -13, zIndex: 3, width: 74, height: 32, borderRadius: 17, borderWidth: 1, borderColor: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.68)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 6 },
  stepBtn: { width: 20, alignItems: "center" },
  stepText: { color: "#fff", fontSize: type.heading, fontWeight: "900" },
  stepQty: { color: "#fff", fontWeight: "900", fontSize: type.body },
  meta: { color: colors.muted, fontWeight: "800", fontSize: type.body },
  homeCard: { width: 148, alignSelf: "flex-start", padding: 9, paddingBottom: 0, backgroundColor: "#FFFFFF", borderRadius: 16, gap: 5 },
  homeImageWrap: { height: 124, backgroundColor: "#F8FAF5", borderWidth: 0, borderRadius: 11, padding: 5, marginBottom: 6 },
  homeDiscountBadge: { top: 0, left: 0, borderRadius: 5, borderTopLeftRadius: 11, backgroundColor: "#5370B9", minHeight: 18, paddingHorizontal: 6 },
  homeDiscountText: { fontSize: 8 },
  homeAdd: { width: 60, height: 30, borderRadius: 8, right: 0, bottom: -8, borderWidth: 1, borderColor: "#6FA77A", backgroundColor: "#F4FBF1" },
  homeAddText: { color: "#24743E", fontSize: 12, lineHeight: 16, fontWeight: "900" },
  homeStepper: { right: 0, bottom: -8, height: 30, width: 78, borderRadius: 8, backgroundColor: "#237344", borderColor: "#237344" },
  homeQtyWrap: { alignSelf: "flex-start", backgroundColor: "#F4F5F1", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3, maxWidth: "100%" },
  homeQty: { color: "#7C857A", fontSize: 10, fontWeight: "500" },
  homeName: { color: "#273128", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  homePriceRow: { marginTop: 0, gap: 6 },
  homePrice: { color: "#253028", fontSize: 15, fontWeight: "800" },
  homeMeta: { color: "#899080", fontSize: 9, fontWeight: "500", marginTop: 2 }
});
