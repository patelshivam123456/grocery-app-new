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

  return (
    <Pressable onPress={onPress} style={[styles.card, compact && styles.compact, grid && styles.gridCard, railGrid && styles.railGridCard]}>
      <View style={styles.imageWrap}>
        <View style={styles.overlayRow}>
          <Pressable onPress={() => dispatch(toggleWishlist(product.id))} style={styles.iconButton}>
            <Ionicons name={wished ? "heart" : "heart-outline"} size={15} color={wished ? colors.danger : colors.muted} />
          </Pressable>
          <Pressable onPress={shareProduct} style={styles.iconButton}>
            <Feather name="share-2" size={13} color={colors.muted} />
          </Pressable>
        </View>
        <SafeRemoteImage uri={displayProduct.imageGallery?.[0]} style={styles.photo} fallback={displayProduct.image} fallbackStyle={styles.image} />
      </View>
      <View style={styles.purchaseRow}>
        <Pressable onPress={nextVariant} disabled={variants.length <= 1} style={styles.qtyWrap}>
          <Text numberOfLines={1} style={styles.qty}>{displayProduct.quantity}{variants.length > 1 ? " ▾" : ""}</Text>
        </Pressable>
        {qty ? (
          <View style={styles.stepper}>
            <Pressable onPress={() => dispatch(decrementCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></Pressable>
            <Text style={styles.stepQty}>{qty}</Text>
            <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.addBtn}>
            <Text style={styles.addText}>ADD</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.priceRow}>
        <Text numberOfLines={1} style={styles.price}>₹{displayProduct.price}</Text>
        <Text numberOfLines={1} style={styles.mrp}>₹{displayProduct.mrp}</Text>
      </View>
      <Text numberOfLines={2} style={styles.name}>{displayProduct.name}</Text>
      <Text style={styles.discount}>{displayProduct.discount} OFF</Text>
      <Text style={styles.meta}>◷ 15 mins • ★ {displayProduct.rating}</Text>
      {onViewDetails ? (
        <Pressable onPress={onViewDetails} style={styles.viewDetails}>
          <Text style={styles.viewText}>View details</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    width: 118,
    backgroundColor: "transparent",
    borderRadius: 8,
    gap: 3,
    minHeight: 236
  },
  compact: { width: "48%" },
  gridCard: { width: "31.7%" },
  railGridCard: { width: "47.5%" },
  imageWrap: { height: 96, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F6FA", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: colors.faint },
  photo: { width: "100%", height: "100%" },
  overlayRow: { position: "absolute", top: 5, left: 5, right: 5, zIndex: 2, flexDirection: "row", justifyContent: "space-between" },
  iconButton: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center" },
  image: { fontSize: 40 },
  purchaseRow: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  qtyWrap: { flex: 1, minWidth: 0 },
  qty: { flex: 1, color: colors.text, fontSize: type.body, fontWeight: "900" },
  name: { minHeight: 31, color: colors.text, fontWeight: "900", fontSize: 11 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 3, minWidth: 0 },
  price: { color: colors.text, fontWeight: "900", fontSize: type.heading, flexShrink: 0 },
  mrp: { color: colors.muted, textDecorationLine: "line-through", fontSize: type.body, flexShrink: 1 },
  discount: { color: colors.info, fontSize: type.body, fontWeight: "900" },
  addBtn: { width: 50, height: 30, borderRadius: 8, borderWidth: 1.4, borderColor: colors.primary, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  addText: { color: colors.primary, fontWeight: "900", fontSize: type.body },
  stepper: { width: 58, height: 30, borderRadius: 8, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: { width: 20, alignItems: "center" },
  stepText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  stepQty: { color: "#fff", fontWeight: "900", fontSize: type.body },
  meta: { color: colors.muted, fontWeight: "800", fontSize: type.body },
  viewDetails: { alignSelf: "flex-start", backgroundColor: "#EAFBEF", borderWidth: 1, borderColor: "#CBEFD3", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, marginTop: 1 },
  viewText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" }
});
