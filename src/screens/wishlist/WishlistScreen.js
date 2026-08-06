import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "../../components/EmptyState";
import CommerceBottomStack, { bottomStackHeight } from "../../components/CommerceBottomStack";
import LocationSheet from "../../components/LocationSheet";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { addToCart, decrementCart } from "../../store/slices/cartSlice";
import { removeWishlist } from "../../store/slices/wishlistSlice";
import { selectSelectedAddress } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function WishlistScreen({ navigation }) {
  const [locationOpen, setLocationOpen] = React.useState(false);
  const ids = useSelector((state) => state.wishlist.ids);
  const products = useSelector((state) => state.products.items.filter((item) => ids.includes(item.id)));
  const cartItems = useSelector((state) => state.cart.items);
  const address = useSelector(selectSelectedAddress);
  const dispatch = useDispatch();
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Tabs", { screen: "Home" }));
  const goCart = () => navigation.navigate("Tabs", { screen: "Home", params: { screen: "Cart" } });
 const insets = useSafeAreaInsets();
  if (!products.length) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
        <WishlistHeader goBack={goBack} address={address} openLocation={() => setLocationOpen(true)} />
        <EmptyState title="Wishlist is empty" subtitle="Save products you buy often and move them to cart later." action="Browse products" onPress={() => navigation.navigate("Tabs", { screen: "Categories" })} />
        <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <WishlistHeader goBack={goBack} address={address} openLocation={() => setLocationOpen(true)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {products.map((item) => (
            <WishlistItem
              key={item.id}
              product={item}
              qty={cartItems[item.id] || 0}
              onOpen={() => navigation.navigate("Tabs", { screen: "Home", params: { screen: "ProductDetails", params: { productId: item.id } } })}
              onAdd={() => dispatch(addToCart(item.id))}
              onDec={() => dispatch(decrementCart(item.id))}
              onRemove={() => dispatch(removeWishlist(item.id))}
            />
          ))}
        </View>
      </ScrollView>
      <CommerceBottomStack navigation={navigation} onCartPress={goCart} bottomOffset={insets.bottom}/>
      <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
    </SafeAreaView>
  );
}

function WishlistHeader({ goBack, address, openLocation }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={goBack} style={styles.back}><Feather name="arrow-left" size={23} color={colors.text} /></Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Your wishlist</Text>
        <Pressable onPress={openLocation}>
          <Text numberOfLines={1} style={styles.location}><Text style={styles.delivering}>Delivering to {address?.label || "Other"}:</Text> {address?.line1 || "add your delivery location"} ▾</Text>
        </Pressable>
      </View>
      <Pressable style={styles.search}><Feather name="search" size={20} color={colors.text} /></Pressable>
    </View>
  );
}

function WishlistItem({ product, qty, onOpen, onAdd, onDec, onRemove }) {
  const share = () => Share.share({ message: `${product.name} is available on Just Harvst for ₹${product.price}` });
  return (
    <Pressable onPress={onOpen} style={styles.wishCard}>
  <View style={styles.imageBox}>
    {/* Discount Badge */}
    <View style={styles.discountBadge}>
      <Text style={styles.discountText}>{product.discount}</Text>
      <Text style={styles.discountOff}>OFF</Text>
    </View>

    <SafeRemoteImage uri={product.imageGallery?.[0]} style={styles.photo} fallback={product.image} fallbackStyle={styles.image} />

    <View style={styles.cardIcons}>
      <Pressable onPress={onRemove} style={styles.iconBtn}>
        <Ionicons name="heart" size={20} color={colors.danger} />
      </Pressable>

      <Pressable onPress={share} style={styles.iconBtn}>
        <Feather name="share-2" size={18} color={colors.muted} />
      </Pressable>
    </View>
  </View>

  <View style={styles.qtyAddRow}>
    <Text style={styles.productQty}>{product.quantity}</Text>

    {qty ? (
      <View style={styles.stepper}>
        <Pressable onPress={onDec}>
          <Text style={styles.step}>−</Text>
        </Pressable>

        <Text style={styles.step}>{qty}</Text>

        <Pressable onPress={onAdd}>
          <Text style={styles.step}>+</Text>
        </Pressable>
      </View>
    ) : (
      <Pressable onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addText}>ADD</Text>
      </Pressable>
    )}
  </View>

  <View style={styles.priceRow}>
    <Text style={styles.price}>₹{product.price}</Text>
    <Text style={styles.mrp}>₹{product.mrp}</Text>
  </View>

  <Text style={styles.priceDrop}>Price Drop</Text>

  <Text numberOfLines={2} style={styles.productName}>
    {product.name}
  </Text>

  <View style={styles.tagRow}>
    <Text style={styles.sectionTag}>{product.section}</Text>
  </View>

  <Text style={styles.rating}>
    ⭐⭐⭐⭐⭐ ({Math.round(product.rating * 590)})
  </Text>

  <Text style={styles.meta}>🕒 8 mins • 📦 1 left</Text>
</Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.faint },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  location: { color: colors.text, fontSize: type.subheading, marginTop: 1 },
  delivering: { color: "#047B7F", fontWeight: "900" },
  search: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  content: { padding: 12, paddingBottom: bottomStackHeight },
  grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 14,
},

wishCard: {
  width: "48%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 8,
  elevation: 3,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 2,
  },
},

imageBox: {
  height: 130,
  borderRadius: 12,
  backgroundColor: "#F7F8FA",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  position: "relative",
},

image: {
  fontSize: 58,
},
photo: {
  width: "100%",
  height: "100%",
},

discountBadge: {
  position: "absolute",
  left: 0,
  top: 0,
  backgroundColor: "#FFD54F",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderBottomRightRadius: 14,
  zIndex: 10,
},

discountText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#222",
},

discountOff: {
  fontSize: 11,
  fontWeight: "700",
},

cardIcons: {
  position: "absolute",
  right: 8,
  top: 8,
},

iconBtn: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 8,
  elevation: 2,
},

qtyAddRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8,
},

productQty: {
  fontSize: 13,
  color: "#666",
  fontWeight: "700",
},

addBtn: {
  backgroundColor: "#0E8F61",
  borderRadius: 18,
  paddingHorizontal: 18,
  height: 34,
  justifyContent: "center",
},

addText: {
  color: "#fff",
  fontWeight: "800",
},

stepper: {
  backgroundColor: "#0E8F61",
  borderRadius: 18,
  width: 88,
  height: 34,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
},

step: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
},

priceRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
},

price: {
  fontSize: 20,
  fontWeight: "900",
  color: "#111",
},

mrp: {
  marginLeft: 6,
  textDecorationLine: "line-through",
  color: "#888",
},

priceDrop: {
  color: "#0E63FF",
  fontWeight: "700",
  fontSize: 12,
  marginTop: 2,
},

productName: {
  fontSize: 15,
  fontWeight: "700",
  color: "#222",
  marginTop: 4,
  minHeight: 38,
},

tagRow: {
  flexDirection: "row",
  marginTop: 6,
},

sectionTag: {
  backgroundColor: "#E9F7EC",
  color: "#2E7D32",
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 10,
  fontSize: 11,
  fontWeight: "700",
},

rating: {
  marginTop: 8,
  fontSize: 12,
  color: "#FF9800",
},

meta: {
  marginTop: 4,
  fontSize: 11,
  color: "#777",
},
});
