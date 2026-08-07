import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../components/AppButton";
import FloatingCartPill from "../../components/FloatingCartPill";
import ProductCard from "../../components/ProductCard";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import SectionHeader from "../../components/SectionHeader";
import { addToCart, decrementCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistSlice";
import { addProductReview, viewProduct } from "../../store/slices/productSlice";
import { selectCartTotals } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedUnit, setSelectedUnit] = React.useState(0);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [activeImage, setActiveImage] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const galleryRef = React.useRef(null);
  const product = useSelector((state) => state.products.items.find((item) => item.id === productId));
  const wished = useSelector((state) => state.wishlist.ids.includes(productId));
  const reviews = useSelector((state) => state.products.reviews?.[productId] || []);
  const similar = useSelector((state) => state.products.items.filter((item) => item.category === product?.category && item.id !== productId).slice(0, 4));
  const cartItems = useSelector((state) => state.cart.items);
  const totals = useSelector(selectCartTotals);

  React.useEffect(() => {
    dispatch(viewProduct(productId));
    setSelectedUnit(0);
    setActiveImage(0);
  }, [dispatch, productId]);

  if (!product) return null;

  const units = getUnits(product);
  const activeUnit = units[selectedUnit];
  const cartPayload = { productId: product.id, unit: activeUnit };
  const cartKey = `${product.id}::${activeUnit.label}`;
  const unitCartQty = cartItems[cartKey] || 0;
  const baseCartQty = cartItems[product.id] || 0;
  const cartQty = unitCartQty || baseCartQty;
  const addCartPayload = baseCartQty && !unitCartQty ? product.id : cartPayload;
  const removeCartPayload = unitCartQty ? cartPayload : product.id;
  const gallery = activeUnit?.imageGallery?.length
    ? activeUnit.imageGallery.map((image, index) => ({ label: `View ${index + 1}`, image }))
    : product.imageGallery?.length
    ? product.imageGallery.map((image, index) => ({ label: `View ${index + 1}`, image }))
    : ["Front", "Pack", "Close", "Fresh"].map((label) => ({ label, image: product.image }));
  const share = () => Share.share({ message: `${product.name} is available on Just Harvst for ₹${activeUnit.price}` });
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" }));
  const addReview = () => {
    if (!reviewText.trim()) return;
    dispatch(addProductReview({ productId, name: reviewName.trim(), rating: reviewRating, text: reviewText.trim() }));
    setReviewName("");
    setReviewText("");
    setReviewRating(5);
    setReviewOpen(false);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.detailRoot}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.detailContent, { paddingBottom: 118 + insets.bottom }]}>
        <View style={styles.heroGallery}>
          <View style={styles.heroActions}>
            <Pressable onPress={() => dispatch(toggleWishlist(product.id))} style={styles.roundAction}>
              <Ionicons name={wished ? "heart" : "heart-outline"} size={22} color={wished ? colors.danger : colors.text} />
            </Pressable>
            <Pressable onPress={() => navigation.getParent()?.navigate("Search")} style={styles.roundAction}>
              <Feather name="search" size={21} color={colors.text} />
            </Pressable>
            <Pressable onPress={share} style={styles.roundAction}>
              <Feather name="share-2" size={20} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setActiveImage(Math.round(event.nativeEvent.contentOffset.x / width))}
          >
            {gallery.map((item) => (
              <Pressable key={item.label} onPress={() => setZoomOpen(true)} style={[styles.heroSlide, { width }]}>
                <SafeRemoteImage uri={item.image} style={styles.heroPhoto} fallback={item.image} fallbackStyle={styles.heroEmoji} />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {gallery.map((item, index) => <View key={item.label} style={[styles.dot, activeImage === index && styles.dotActive]} />)}
          </View>
          <Pressable onPress={() => setDetailsOpen(true)} style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View details</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.deliveryLine}>◷ {product.deliveryTime || "9 mins"}</Text>
          <Text style={styles.productTitle}>{product.name}</Text>
          <View style={styles.weightRow}>
            <Text style={styles.productWeight}>{activeUnit.label}</Text>
            <Text style={styles.leftBadge}>{activeUnit.stock || product.stock || 0} left</Text>
          </View>
          <View style={styles.priceLine}>
            <Text style={styles.productPrice}>₹{activeUnit.price}</Text>
            <Text style={styles.productMrp}>MRP ₹{activeUnit.mrp}</Text>
          </View>
        </View>

        <View style={styles.storeCard}>
          <View style={styles.storeLogo}><Text style={styles.storeLogoText}>fresh</Text></View>
          <View style={styles.storeCopy}>
            <Text style={styles.storeTitle}>Freshbury</Text>
            <Text style={styles.storeSub}>Explore all products</Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.text} />
        </View>

        <View style={styles.storeCard}>
          <View style={styles.replacementIcon}>
            <Feather name="shield" size={20} color={colors.primaryDark} />
          </View>
          <Text style={styles.replacementText}>48 hours only replacement</Text>
          <Feather name="chevron-right" size={22} color={colors.text} />
        </View>
<View style={{paddingHorizontal:12, paddingTop: 12, gap: 6}}>
        <Text style={styles.sectionMini}>Select unit</Text>
        <View style={styles.unitRow}>
          {units.map((unit, index) => (
            <Pressable key={unit.label} onPress={() => setSelectedUnit(index)} style={[styles.unitChip, selectedUnit === index && styles.unitChipActive]}>
              <Text style={[styles.unitLabel, selectedUnit === index && styles.unitLabelActive]}>{unit.label}</Text>
              <Text style={[styles.unitPrice, selectedUnit === index && styles.unitLabelActive]}>₹{unit.price}</Text>
            </Pressable>
          ))}
        </View>
</View>
        <View style={styles.ratingSummaryCard}>
          <View style={styles.ratingSummaryTop}>
            <View>
              <Text style={styles.sectionMini}>Ratings & reviews</Text>
              <Text style={styles.body}>{reviews.length || product.totalReviews || 0} reviews • average {reviews.length ? averageRating(reviews) : product.rating}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>{product.rating} ★</Text>
            </View>
          </View>
          <RatingBreakdown reviews={reviews} fallbackRating={product.rating} />
          <Pressable onPress={() => setReviewOpen(true)} style={styles.addReviewButton}>
            <Text style={styles.addReviewText}>Add review</Text>
          </Pressable>
        </View>
        <View style={{paddingVertical:12,paddingHorizontal:12, gap: 12}}>
          {reviews.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}
        </View>
        {reviews.length > 3 ? (
          <Pressable onPress={() => navigation.navigate("ProductReviews", { productId })} style={styles.viewMoreReviews}>
            <Text style={styles.viewMoreReviewsText}>View all reviews</Text>
          </Pressable>
        ) : null}

        {similar.length ? (
          <View style={{paddingHorizontal:12}}>
            <View style={{paddingTop:20}}><SectionHeader title="Similar products" /></View>
            <View style={styles.similar}>
              {similar.map((item) => <ProductCard key={item.id} compact product={item} onPress={() => navigation.push("ProductDetails", { productId: item.id })} />)}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" style={styles.topActions}>
        <Pressable onPress={goBack} style={styles.roundAction}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
      </View>
      {totals.count ? <FloatingCartPill navigation={navigation} bottomOffset={86 + insets.bottom} /> : null}
      <View style={[styles.purchaseBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.purchaseCopy}>
          <Text style={styles.purchaseWeight}>{activeUnit.label}</Text>
          <View style={styles.purchasePriceRow}>
            <Text style={styles.purchasePrice}>₹{activeUnit.price}</Text>
            <Text style={styles.purchaseMrp}>MRP ₹{activeUnit.mrp}</Text>
          </View>
          <Text style={styles.taxText}>Inclusive of all taxes</Text>
        </View>
        {cartQty ? (
          <View style={styles.purchaseStepper}>
            <Pressable onPress={() => dispatch(decrementCart(removeCartPayload))} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>−</Text></Pressable>
            <Text style={styles.purchaseQty}>{cartQty}</Text>
            <Pressable onPress={() => dispatch(addToCart(addCartPayload))} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable onPress={() => dispatch(addToCart(addCartPayload))} style={styles.purchaseAddButton}>
            <Text style={styles.purchaseAddText}>Add to cart</Text>
          </Pressable>
        )}
      </View>
      <ProductDetailsSheet
        visible={detailsOpen}
        product={product}
        unit={activeUnit}
        image={gallery[0]?.image}
        wished={wished}
        onClose={() => setDetailsOpen(false)}
        onWish={() => dispatch(toggleWishlist(product.id))}
        onShare={share}
        cartQty={cartQty}
        onAdd={() => dispatch(addToCart(addCartPayload))}
        onRemove={() => dispatch(decrementCart(removeCartPayload))}
        navigation={navigation}
      />
      <ZoomModal visible={zoomOpen} image={gallery[activeImage]?.image} onClose={() => setZoomOpen(false)} />
      <ReviewModal
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        name={reviewName}
        setName={setReviewName}
        text={reviewText}
        setText={setReviewText}
        rating={reviewRating}
        setRating={setReviewRating}
        onSubmit={addReview}
      />
    </SafeAreaView>
  );
}

function ProductDetailsSheet({ visible, product, unit, image, wished, onClose, onWish, onShare, cartQty, onAdd, onRemove, navigation }) {
  const insets = useSafeAreaInsets();
  const description = product.description || `${product.desc} selected for freshness, natural taste, and quick daily grocery delivery.`;
  const keyInfo = [
    ["Brand", product.brand || "Just Harvst"],
    ["Tags", (product.tags || []).join(", ") || "Fresh grocery"],
    ["Variants", (product.variants || []).map((variant) => variant.label).join(", ") || unit.label]
  ];
  const infoRows = [
    ["Name", product.name],
    ["Description", description],
    ["SKU", product.sku || "Not available"],
    ["Barcode", product.barcode || "Not available"],
    ["HSN", product.hsn || product.hsnCode || "Not available"],
    ["Unit", unit.label],
    ["MRP", `₹${unit.mrp}`],
    ["Selling Price", `₹${unit.price}`],
    ["Discount", unit.discount || product.discount || "0%"],
    ["Rating", `${unit.rating ?? product.rating ?? 0} ★`],
    ["Stock", String(unit.stock ?? product.stock ?? 0)],
    ["Returnable", unit.returnable ? "Yes" : "No"],
    ["COD", unit.codAvailable ? "Available" : "Not available"],
    ["Country of Origin", product.countryOfOrigin || "India"],
    ["Additional Details", formatAdditionalDetails(product.additionalDetails)]
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailsOverlay}>
        <Pressable style={styles.detailsDim} onPress={onClose} />
        <Pressable onPress={onClose} style={styles.detailsClose}><Feather name="x" size={30} color="#fff" /></Pressable>
        <View style={styles.detailsSheet}>
          <View style={styles.detailsHeader}>
            <View style={styles.sheetThumb}>
              <SafeRemoteImage uri={image} style={styles.sheetThumbPhoto} fallback={image} fallbackStyle={styles.sheetThumbEmoji} />
            </View>
            <Text numberOfLines={2} style={styles.sheetTitleText}>{product.name}</Text>
            <Pressable onPress={onWish} style={styles.sheetIcon}>
              <Ionicons name={wished ? "heart" : "heart-outline"} size={22} color={wished ? colors.danger : colors.text} />
            </Pressable>
            <Pressable onPress={onShare} style={styles.sheetIcon}><Feather name="share-2" size={20} color={colors.text} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={[styles.sheetBody, { paddingBottom: 162 + insets.bottom }]} showsVerticalScrollIndicator={false}>
            <Text style={styles.allDetailsTitle}>All details</Text>
            <View style={styles.packImageWrap}>
              <SafeRemoteImage uri={image} style={styles.packImage} resizeMode="contain" fallback={image} fallbackStyle={styles.packEmoji} />
            </View>
            <View style={styles.accordionCard}>
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>Key Information</Text>
                <Feather name="chevron-up" size={20} color={colors.text} />
              </View>
              {keyInfo.map(([label, value]) => <SheetRow key={label} label={label} value={value} />)}
            </View>
            <View style={styles.accordionCard}>
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>Info</Text>
                <Feather name="chevron-up" size={20} color={colors.text} />
              </View>
              {infoRows.map(([label, value]) => <SheetRow key={label} label={label} value={value} />)}
            </View>
          </ScrollView>
          <View style={[styles.purchaseBar, styles.sheetPurchaseBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <View style={styles.purchaseCopy}>
              <Text style={styles.purchaseWeight}>{unit.label}</Text>
              <View style={styles.purchasePriceRow}>
                <Text style={styles.purchasePrice}>₹{unit.price}</Text>
                <Text style={styles.purchaseMrp}>MRP ₹{unit.mrp}</Text>
              </View>
              <Text style={styles.taxText}>Inclusive of all taxes</Text>
            </View>
            {cartQty ? (
              <View style={styles.purchaseStepper}>
                <Pressable onPress={onRemove} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>−</Text></Pressable>
                <Text style={styles.purchaseQty}>{cartQty}</Text>
                <Pressable onPress={onAdd} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>+</Text></Pressable>
              </View>
            ) : (
              <Pressable onPress={onAdd} style={styles.purchaseAddButton}>
                <Text style={styles.purchaseAddText}>Add to cart</Text>
              </Pressable>
            )}
          </View>
          <FloatingCartPill navigation={navigation} bottomOffset={96 + insets.bottom} />
        </View>
      </View>
    </Modal>
  );
}

function SheetRow({ label, value }) {
  return (
    <View style={styles.sheetRow}>
      <Text style={styles.sheetRowLabel}>{label}</Text>
      <Text style={styles.sheetRowValue}>{value}</Text>
    </View>
  );
}

function RatingBreakdown({ reviews, fallbackRating }) {
  const total = Math.max(reviews.length, 1);
  return (
    <View style={styles.infoCard}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.length ? reviews.filter((review) => review.rating === rating).length : Math.round(fallbackRating) === rating ? 1 : 0;
        return (
          <View key={rating} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{rating} ★</Text>
            <View style={styles.ratingTrack}><View style={[styles.ratingFill, { width: `${(count / total) * 100}%` }]} /></View>
            <Text style={styles.ratingCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ZoomModal({ visible, image, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.zoomRoot}>
        <Pressable onPress={onClose} style={styles.zoomClose}><Feather name="x" size={26} color="#fff" /></Pressable>
        <ScrollView maximumZoomScale={3} minimumZoomScale={1} contentContainerStyle={styles.zoomContent}>
          <SafeRemoteImage uri={image} style={styles.zoomImage} resizeMode="contain" fallback={image} fallbackStyle={styles.zoomEmoji} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function ReviewCard({ review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <Text style={styles.reviewName}>{review.name}</Text>
        <Text style={styles.reviewStars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</Text>
      </View>
      <Text style={styles.body}>{review.text}</Text>
      <Text style={styles.date}>{review.date}</Text>
    </View>
  );
}

function ReviewModal({ visible, onClose, name, setName, text, setText, rating, setRating, onSubmit }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDim} onPress={onClose} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add rating & review</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Pressable key={item} onPress={() => setRating(item)}>
                <Text style={[styles.star, item <= rating && styles.starActive]}>★</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={styles.modalInput} />
          <TextInput value={text} onChangeText={setText} placeholder="Write your review" placeholderTextColor={colors.muted} multiline style={[styles.modalInput, styles.modalText]} />
          <View style={styles.modalActions}>
            <AppButton title="Cancel" variant="outline" onPress={onClose} style={styles.modalButton} />
            <AppButton title="Submit" onPress={onSubmit} style={styles.modalButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getUnits(product) {
  if (product.variants?.length) return product.variants;
  return [{ label: product.quantity, price: product.price, mrp: product.mrp, stock: product.stock, imageGallery: product.imageGallery }];
}

function formatAdditionalDetails(details) {
  if (!details || typeof details !== "object") return "Not available";
  return Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(", ");
}

function averageRating(reviews) {
  if (!reviews.length) return "0.0";
  return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
}

const styles = StyleSheet.create({
  detailRoot: { flex: 1, backgroundColor: "#F6F7FB" },
  detailContent: { backgroundColor: "#F6F7FB" },
  heroGallery: { height: 365, backgroundColor: "#EFE9DD", overflow: "hidden" },
  heroSlide: { height: 365, alignItems: "center", justifyContent: "center" },
  heroPhoto: { width: "100%", height: "100%" },
  heroEmoji: { fontSize: 126 },
  topActions: { position: "absolute", top: 30, left: 12, zIndex: 40, elevation: 8 },
  heroActions: { position: "absolute", top: 12, right: 12, zIndex: 10, elevation: 4, flexDirection: "row", gap: 10 },
  roundAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: "rgba(17,24,39,0.08)", alignItems: "center", justifyContent: "center" },
  dots: { position: "absolute", bottom: 44, alignSelf: "center", flexDirection: "row", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#DDE0E7" },
  dotActive: { backgroundColor: "#6B7280" },
  viewDetailsButton: { position: "absolute", right: 12, bottom: 20, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#BEE7BF", backgroundColor: "#EDFFF0", paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  viewDetailsText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" },
  summaryCard: { marginTop: -8, marginHorizontal: 12, backgroundColor: colors.surface, borderRadius: 10, padding: 14, gap: 5 },
  ratingSummaryCard: { marginHorizontal: 12, marginTop: 12, backgroundColor: colors.surface, borderRadius: 10, padding: 12, gap: 10 },
  ratingSummaryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  ratingBadge: { minWidth: 56, height: 32, borderRadius: 8, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  ratingBadgeText: { color: colors.primaryDark, fontSize: type.subheading, fontWeight: "900" },
  addReviewButton: { height: 38, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  addReviewText: { color: colors.primary, fontSize: type.subheading, fontWeight: "900" },
  viewMoreReviews: { marginHorizontal: 12, height: 40, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  viewMoreReviewsText: { color: colors.primaryDark, fontSize: type.subheading, fontWeight: "900" },
  deliveryLine: { color: colors.muted, fontSize: type.body, fontWeight: "800" },
  productTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  productWeight: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  leftBadge: { color: colors.muted, fontSize: type.body, backgroundColor: "#F3F4F6", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, overflow: "hidden" },
  priceLine: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  productPrice: { color: colors.text, fontSize: 20, fontWeight: "900" },
  productMrp: { color: colors.muted, fontSize: type.body, textDecorationLine: "line-through" },
  storeCard: { marginHorizontal: 12, marginTop: 10, minHeight: 58, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  storeLogo: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#64BD3D", alignItems: "center", justifyContent: "center" },
  storeLogoText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  storeCopy: { flex: 1, minWidth: 0 },
  storeTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  storeSub: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  replacementIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  replacementText: { flex: 1, color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  purchaseBar: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 82, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.faint, paddingTop: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 12, zIndex: 30 },
  purchaseCopy: { flex: 1, minWidth: 0 },
  purchaseWeight: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  purchasePriceRow: { flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 1 },
  purchasePrice: { color: colors.text, fontSize: 18, fontWeight: "900" },
  purchaseMrp: { color: colors.muted, fontSize: type.body },
  taxText: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  purchaseAddButton: { width: 126, height: 40, borderRadius: 9, backgroundColor: "#218A10", alignItems: "center", justifyContent: "center" },
  purchaseAddText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  purchaseStepper: { width: 126, height: 40, borderRadius: 9, backgroundColor: "#218A10", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  purchaseStepButton: { width: 22, height: 34, alignItems: "center", justifyContent: "center" },
  purchaseStepText: { color: "#fff", fontSize: 28, lineHeight: 30, fontWeight: "900" },
  purchaseQty: { color: "#fff", fontSize: 15, fontWeight: "900" },
  detailsOverlay: { flex: 1, justifyContent: "flex-end" },
  detailsDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.78)" },
  detailsClose: { position: "absolute", alignSelf: "center", bottom: "66%", width: 58, height: 58, borderRadius: 29, backgroundColor: "#1F2028", borderWidth: 1, borderColor: "#343541", alignItems: "center", justifyContent: "center", zIndex: 5 },
  detailsSheet: { maxHeight: "70%", backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
  detailsHeader: { minHeight: 88, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.faint },
  sheetThumb: { width: 54, height: 54, borderRadius: 12, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  sheetThumbPhoto: { width: "100%", height: "100%" },
  sheetThumbEmoji: { fontSize: 28 },
  sheetTitleText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 20, fontWeight: "900" },
  sheetIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F6F7FC", alignItems: "center", justifyContent: "center" },
  sheetBody: { padding: 14, gap: 12 },
  allDetailsTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  packImageWrap: { height: 220, alignItems: "center", justifyContent: "center" },
  packImage: { width: "86%", height: "100%" },
  packEmoji: { fontSize: 120 },
  accordionCard: { borderRadius: 10, backgroundColor: "#F7F8FE", overflow: "hidden" },
  accordionHeader: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.faint, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  accordionTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  sheetRow: { flexDirection: "row", gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  sheetRowLabel: { width: "34%", color: colors.text, fontSize: type.body, lineHeight: 15, fontWeight: "900" },
  sheetRowValue: { flex: 1, color: colors.muted, fontSize: type.body, lineHeight: 15, fontWeight: "700" },
  sheetPurchaseBar: { zIndex: 4 },
  root: { flex: 1, backgroundColor: "#F5F6FB" },
  header: { height: 52, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.faint },
  backText: { fontSize: 20, lineHeight: 22, color: colors.text },
  headerTitle: { flex: 1, fontSize: type.heading, fontWeight: "900", color: colors.text },
  headerIcon: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  content: { padding: 12, gap: 12, paddingBottom: 262 },
  galleryCard: { height: 230, borderRadius: 8, backgroundColor: "#F2F3F6", overflow: "hidden" },
  slide: { height: 230, alignItems: "center", justifyContent: "center" },
  productImage: { fontSize: 96 },
  productPhoto: { width: "100%", height: "100%" },
  angleLabel: { position: "absolute", bottom: 12, color: colors.muted, fontSize: type.body, fontWeight: "800" },
  activeImageDot: { position: "absolute", bottom: 8, width: 36, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  galleryActions: { position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 6 },
  thumbnailRow: { gap: 8 },
  thumbnail: { width: 58, height: 58, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbnailActive: { borderColor: colors.primary, borderWidth: 2 },
  thumbnailPhoto: { width: "100%", height: "100%" },
  thumbnailEmoji: { fontSize: 26 },
  overlayBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  overlayText: { fontSize: type.heading, color: colors.text, fontWeight: "900" },
  infoCard: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 7 },
  metaRow: { flexDirection: "row", gap: 10 },
  meta: { color: colors.muted, fontWeight: "800", fontSize: type.body },
  rating: { color: "#E9B600", fontWeight: "900", fontSize: type.body },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, lineHeight: 17 },
  sub: { color: colors.muted, fontSize: type.subheading },
  sectionMini: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  unitRow: { flexDirection: "row", gap: 8 },
  unitChip: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, padding: 8, backgroundColor: colors.surface },
  unitChipActive: { backgroundColor: "#EAFBEF", borderColor: colors.primary },
  unitLabel: { color: colors.text, fontWeight: "900", fontSize: type.body },
  unitPrice: { color: colors.muted, marginTop: 2, fontWeight: "800", fontSize: type.body },
  unitLabelActive: { color: colors.primaryDark },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  price: { fontSize: type.heading, color: colors.text, fontWeight: "900" },
  mrp: { color: colors.muted, textDecorationLine: "line-through", fontSize: type.body },
  discount: { color: colors.info, fontWeight: "900", fontSize: type.body },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  actionButton: { flex: 1, borderRadius: 8 },
  qtySelector: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.primary, overflow: "hidden" },
  qtyBtn: { width: 38, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: "#EAFBEF" },
  qtyText: { color: colors.primaryDark, fontSize: type.heading, fontWeight: "900" },
  qtyValue: { minWidth: 42, textAlign: "center", color: colors.text, fontSize: type.heading, fontWeight: "900" },
  offerCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderRadius: 8, padding: 12 },
  offerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EAF4FF", textAlign: "center", textAlignVertical: "center", color: colors.info, fontWeight: "900", fontSize: type.heading },
  offerTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  body: { color: colors.muted, lineHeight: 16, fontSize: type.body },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detail: { width: "48%", borderRadius: 8, backgroundColor: "#F7F8FB", padding: 9 },
  detailLabel: { color: colors.muted, fontSize: type.body, textTransform: "capitalize" },
  detailValue: { color: colors.text, fontSize: type.body, fontWeight: "900", marginTop: 2 },
  reviewHeader: { gap: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingLabel: { width: 32, color: colors.text, fontSize: type.body, fontWeight: "900" },
  ratingTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.faint, overflow: "hidden" },
  ratingFill: { height: "100%", backgroundColor: "#E9B600" },
  ratingCount: { width: 20, color: colors.muted, fontSize: type.body, textAlign: "right" },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 8, padding: 10, gap: 5 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  reviewName: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  reviewStars: { color: "#E9B600", fontSize: type.body, fontWeight: "900" },
  date: { color: colors.muted, fontSize: type.body },
  feature: { color: colors.text, backgroundColor: colors.surface, padding: 10, borderRadius: 8, fontSize: type.body },
  similar: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14, gap: 12 },
  modalTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  starRow: { flexDirection: "row", gap: 10 },
  star: { color: colors.faint, fontSize: 26 },
  starActive: { color: "#E9B600" },
  modalInput: { minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 10, color: colors.text, fontSize: type.body },
  modalText: { minHeight: 86, paddingTop: 10, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 8 },
  modalButton: { flex: 1 },
  stickyActions: { position: "absolute", left: 12, right: 12, bottom: 198, flexDirection: "row", gap: 8, backgroundColor: "rgba(245,246,251,0.96)", paddingTop: 8 },
  stickyButton: { flex: 1 },
  zoomRoot: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  zoomContent: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  zoomImage: { width: "100%", height: 420 },
  zoomEmoji: { fontSize: 150 },
  zoomClose: { position: "absolute", top: 42, right: 18, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", zIndex: 3 },
});
