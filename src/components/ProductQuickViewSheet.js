import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decrementCart } from "../store/slices/cartSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import { applyVariant } from "../services/catalogApi";
import SafeRemoteImage from "./SafeRemoteImage";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function ProductQuickViewSheet({ product, visible, onClose, onOpenFull }) {
  const dispatch = useDispatch();
  const [variantIndex, setVariantIndex] = React.useState(0);
  const variants = product?.variants || product?.productVariantList || [];
  const activeVariant = variants[variantIndex] || product?.selectedVariant;
  const displayProduct = React.useMemo(() => applyVariant(product, activeVariant), [activeVariant, product]);
  const cartPayload = activeVariant && product ? { productId: product.id, unit: activeVariant } : product?.id;
  const cartKey = activeVariant && product ? `${product.id}::${activeVariant.label}` : product?.id;
  const wished = useSelector((state) => product ? state.wishlist.ids.includes(product.id) : false);
  const qty = useSelector((state) => product ? state.cart.items[cartKey] || state.cart.items[product.id] || 0 : 0);

  if (!product) return null;

  const shareProduct = () => Share.share({ message: `${displayProduct.name} is available on Just Harvst for ₹${displayProduct.price}` });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dim} onPress={onClose} />
        <Pressable style={styles.closeFloat} onPress={onClose}>
          <Feather name="x" size={28} color="#fff" />
        </Pressable>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.thumb}>
              <SafeRemoteImage uri={displayProduct.imageGallery?.[0]} style={styles.photo} fallback={displayProduct.image} fallbackStyle={styles.emoji} />
            </View>
            <View style={styles.titleWrap}>
              <Text numberOfLines={2} style={styles.title}>{displayProduct.name}</Text>
              <Text style={styles.sub}>{displayProduct.quantity}</Text>
            </View>
            <Pressable onPress={() => dispatch(toggleWishlist(product.id))} style={styles.iconButton}>
              <Ionicons name={wished ? "heart" : "heart-outline"} size={21} color={wished ? colors.danger : colors.text} />
            </Pressable>
            <Pressable onPress={shareProduct} style={styles.iconButton}>
              <Feather name="share-2" size={19} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{displayProduct.price}</Text>
              <Text style={styles.mrp}>MRP ₹{displayProduct.mrp}</Text>
              <Text style={styles.discount}>{displayProduct.discount} OFF</Text>
            </View>
            {variants.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantRow}>
                {variants.map((variant, index) => (
                  <Pressable key={variant.id || variant.label} onPress={() => setVariantIndex(index)} style={[styles.variantChip, variantIndex === index && styles.variantChipActive]}>
                    <Text style={[styles.variantText, variantIndex === index && styles.variantTextActive]}>{variant.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.copy}>{displayProduct.desc}</Text>
            <Text style={styles.sectionTitle}>Key details</Text>
            <View style={styles.detailGrid}>
              <Detail label="Delivery" value="8-15 mins" />
              <Detail label="Rating" value={`${displayProduct.rating} ★`} />
              <Detail label="Pack size" value={displayProduct.quantity} />
              <Detail label="Stock" value={`${displayProduct.stock}`} />
            </View>
            {product.features?.map((item) => <Text key={item} style={styles.feature}>• {item}</Text>)}
          </ScrollView>
          <View style={styles.footer}>
            <View>
              <Text style={styles.sub}>{displayProduct.quantity}</Text>
              <Text style={styles.price}>₹{displayProduct.price}</Text>
            </View>
            {qty ? (
              <View style={styles.stepper}>
                <Pressable onPress={() => dispatch(decrementCart(cartPayload))} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable>
                <Text style={styles.stepQty}>{qty}</Text>
                <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.stepButton}><Text style={styles.stepText}>+</Text></Pressable>
              </View>
            ) : (
              <Pressable onPress={() => dispatch(addToCart(cartPayload))} style={styles.addButton}>
                <Text style={styles.addText}>Add to cart</Text>
              </Pressable>
            )}
            <Pressable onPress={onOpenFull} style={styles.fullButton}>
              <Text style={styles.fullText}>Full details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.72)" },
  closeFloat: { position: "absolute", alignSelf: "center", bottom: "68%", width: 52, height: 52, borderRadius: 26, backgroundColor: "#1E1F27", alignItems: "center", justifyContent: "center", zIndex: 3 },
  sheet: { maxHeight: "68%", backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.faint },
  thumb: { width: 54, height: 54, borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F7F8FB", alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%", borderRadius: 9 },
  emoji: { fontSize: 30 },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: type.heading, lineHeight: 17, fontWeight: "900" },
  sub: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  iconButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F5F6FB", alignItems: "center", justifyContent: "center" },
  body: { padding: 14, gap: 10 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 7 },
  price: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  mrp: { color: colors.muted, fontSize: type.body, textDecorationLine: "line-through" },
  discount: { color: colors.info, fontSize: type.body, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  copy: { color: colors.muted, fontSize: type.body, lineHeight: 16 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detail: { width: "48%", borderRadius: 8, backgroundColor: "#F7F8FB", padding: 9 },
  detailLabel: { color: colors.muted, fontSize: type.body },
  detailValue: { color: colors.text, fontSize: type.subheading, fontWeight: "900", marginTop: 2 },
  feature: { color: colors.text, fontSize: type.body, backgroundColor: "#F7F8FB", borderRadius: 8, padding: 8 },
  variantRow: { gap: 8 },
  variantChip: { minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  variantChipActive: { backgroundColor: "#EAFBEF", borderColor: colors.primary },
  variantText: { color: colors.text, fontSize: type.body, fontWeight: "900" },
  variantTextActive: { color: colors.primaryDark },
  footer: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.faint },
  addButton: { flex: 1, height: 44, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  addText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  stepper: { flex: 1, height: 44, borderRadius: 10, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  stepButton: { width: 30, height: 40, alignItems: "center", justifyContent: "center" },
  stepText: { color: "#fff", fontSize: 24, lineHeight: 26, fontWeight: "900" },
  stepQty: { color: "#fff", fontSize: type.heading, fontWeight: "900" },
  fullButton: { height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  fullText: { color: colors.primary, fontSize: type.body, fontWeight: "900" }
});
