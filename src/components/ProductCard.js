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

function ProductCard({ product, onPress, compact = false, grid = false, railGrid = false, onViewDetails }) {
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
    <Pressable onPress={onPress} style={[styles.card, compact && styles.compact, grid && styles.gridCard, railGrid && styles.railGridCard]}>
      <View style={styles.imageWrap}>
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text numberOfLines={1} style={styles.discountBadgeText}>{displayProduct.discount} OFF</Text>
          </View>
        ) : null}
        <View style={styles.overlayColumn}>
          <Pressable onPress={() => dispatch(toggleWishlist(product.id))} style={styles.iconButton}>
            <Ionicons name={wished ? "heart" : "heart-outline"} size={15} color={wished ? colors.danger : colors.muted} />
          </Pressable>
          <Pressable onPress={shareProduct} style={styles.iconButton}>
            <Feather name="share-2" size={13} color={colors.muted} />
          </Pressable>
        </View>
        <SafeRemoteImage uri={activeImage} style={styles.photo} fallback={displayProduct.image} fallbackStyle={styles.image} />
        {qty ? (
          <View style={styles.stepper}>
            <Pressable onPress={() => dispatch(decrementCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></Pressable>
            <Text style={styles.stepQty}>{qty}</Text>
            <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={nextVariant} disabled={variants.length <= 1} style={styles.qtyWrap}>
        <Text numberOfLines={1} style={styles.qty}>{displayProduct.quantity}{variants.length > 1 ? " ▾" : ""}</Text>
      </Pressable>
      <Text  style={styles.name}>{displayProduct.name}</Text>
      <View style={styles.priceRow}>
        <Text numberOfLines={1} style={styles.price}>₹{displayProduct.price}</Text>
        <Text numberOfLines={1} style={styles.mrp}>₹{displayProduct.mrp}</Text>
      </View>
      <Text style={styles.meta}>◷ 15 mins • ★ {displayProduct.rating}</Text>
    </Pressable>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    width: 118,
    backgroundColor: "transparent",
    borderRadius: 12,
    gap: 4,
    minHeight: 210
  },
  compact: { width: "48%" },
  gridCard: { width: "31.7%" },
  railGridCard: { width: "47.5%" },
  imageWrap: { height: 106, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F6FA", borderRadius: 12, overflow: "visible", borderWidth: 1, borderColor: colors.faint },
  photo: { width: "100%", height: "100%", borderRadius: 12 },
  overlayColumn: { position: "absolute", top: 5, right: 5, zIndex: 2, gap: 5 },
  iconButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.96)", alignItems: "center", justifyContent: "center" },
  discountBadge: { position: "absolute", top: 6, left: 6, zIndex: 2, maxWidth: 72, minHeight: 22, borderRadius: 11, backgroundColor: colors.primary, paddingHorizontal: 7, alignItems: "center", justifyContent: "center" },
  discountBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  image: { fontSize: 40 },
  qtyWrap: { minWidth: 0 },
  qty: { flex: 1, color: colors.text, fontSize: type.body, fontWeight: "900" },
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
  meta: { color: colors.muted, fontWeight: "800", fontSize: type.body }
});
