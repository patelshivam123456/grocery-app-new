import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../components/AppButton";
import ProductCard from "../../components/ProductCard";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import ProductImageViewer from "../../components/ProductImageViewer";
import { addToCart, decrementCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistSlice";
import { addProductReview, viewProduct } from "../../store/slices/productSlice";
import { selectCartTotals, selectProductReviews } from "../../store/selectors";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const galleryWidth = width - insets.left - insets.right;
  const galleryHeight = Math.min(300, Math.max(220, galleryWidth * 0.66));
  const [selectedUnit, setSelectedUnit] = React.useState(0);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [activeImage, setActiveImage] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const galleryRef = React.useRef(null);
  const products = useSelector((state) => state.products.items);
  const product = products.find((item) => item.id === productId);
  const wished = useSelector((state) => state.wishlist.ids.includes(productId));
  const reviews = useSelector((state) => selectProductReviews(state, productId));
  const similar = React.useMemo(() => product ? products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4) : [], [products, product]);
  const cartItems = useSelector((state) => state.cart.items);
  const totals = useSelector(selectCartTotals);

  React.useEffect(() => {
    dispatch(viewProduct(productId));
    setSelectedUnit(0);
    setActiveImage(0);
    galleryRef.current?.scrollTo({ x: 0, animated: false });
  }, [dispatch, productId]);

  if (!product) return null;

  const units = getUnits(product);
  const activeUnit = units[selectedUnit] || units[0];
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
    : [{ label: "Product image", image: product.image }];
  const savings = Number(Math.max(0, activeUnit.mrp - activeUnit.price).toFixed(2));
  const stock = activeUnit.stock ?? product.stock;
  const rating = reviews.length ? averageRating(reviews) : product.rating;
  const description = product.shortDescription || product.description || product.desc;
  const chooseUnit = (index) => {
    setSelectedUnit(index);
    setActiveImage(0);
    galleryRef.current?.scrollTo({ x: 0, animated: false });
  };
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
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.roundAction}><Feather name="arrow-left" size={22} color="#0D7163" /></Pressable>
        <Text numberOfLines={1} style={styles.detailHeaderTitle}>{product.categoryName || "Just Harvst"}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={wished ? "Remove from wishlist" : "Save to wishlist"} accessibilityState={{ selected: wished }} onPress={() => dispatch(toggleWishlist(product.id))} style={styles.roundAction}><Ionicons name={wished ? "heart" : "heart-outline"} size={21} color={wished ? colors.danger : "#0D7163"} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`View cart, ${totals.count} items`} onPress={() => navigation.navigate("Cart")} style={styles.roundAction}>
          <Feather name="shopping-bag" size={21} color="#0D7163" />
          {totals.count > 0 ? <View style={styles.cartCountBadge}><Text style={styles.cartCountText}>{totals.count > 99 ? "99+" : totals.count}</Text></View> : null}
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.detailContent, { paddingBottom: 100 + insets.bottom }]}>
        <View style={[styles.heroGallery, { height: galleryHeight }]}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setActiveImage(Math.round(event.nativeEvent.contentOffset.x / galleryWidth))}
          >
            {gallery.map((item, index) => (
              <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Enlarge ${product.name}, image ${index + 1}`} onPress={() => { setActiveImage(index); setZoomOpen(true); }} style={[styles.heroSlide, { width: galleryWidth, height: galleryHeight }]}>
                <SafeRemoteImage uri={item.image} imageSize={1000} style={styles.heroPhoto} resizeMode="contain" fallback={item.image} fallbackStyle={styles.heroEmoji} />
              </Pressable>
            ))}
          </ScrollView>
          <View pointerEvents="none" style={styles.galleryHint}><Feather name="zoom-in" size={12} color="#6E8177" /><Text style={styles.galleryHintText}>Tap to enlarge</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Share product" onPress={share} style={styles.galleryShare}><Feather name="share-2" size={17} color="#3D5145" /></Pressable>
        </View>
        {gallery.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryThumbnails}>
          {gallery.map((item, index) => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`View product image ${index + 1}`} accessibilityState={{ selected: activeImage === index }} onPress={() => { setActiveImage(index); galleryRef.current?.scrollTo({ x: index * galleryWidth, animated: true }); }} style={[styles.galleryThumb, activeImage === index && styles.galleryThumbActive]}>
            <SafeRemoteImage uri={item.image} style={styles.galleryThumbPhoto} resizeMode="contain" fallback={item.image} fallbackStyle={styles.thumbnailEmoji} />
          </Pressable>)}
        </ScrollView> : null}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text numberOfLines={1} style={styles.brandName}>{product.brand || "Just Harvst"}</Text>
            {rating > 0 ? <View style={styles.inlineRating}><Ionicons name="star" size={11} color="#0D7163" /><Text style={styles.inlineRatingText}>{rating}</Text></View> : null}
          </View>
          <Text style={styles.productTitle}>{product.name}</Text>
          <View style={styles.weightRow}>
            <Text style={styles.productWeight}>{activeUnit.label}</Text>
            {stock != null && stock <= 10 ? <Text style={[styles.stockText, stock <= 0 && styles.stockUnavailable]}>{stock > 0 ? `Only ${stock} left` : "Out of stock"}</Text> : null}
          </View>
          <View style={styles.priceLine}>
            <Text style={styles.productPrice}>₹{activeUnit.price}</Text>
            {savings > 0 ? <Text style={styles.productMrp}>MRP ₹{activeUnit.mrp}</Text> : null}
            {savings > 0 ? <Text style={styles.savingsBadge}>Save ₹{savings}</Text> : null}
          </View>
          <Text style={styles.taxText}>Inclusive of all taxes</Text>
        </View>
        {units.length > 1 ? <View style={styles.packSection}>
        <Text style={[styles.sectionMini, { marginHorizontal: 16 }]}>Select pack size</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packOptions}>
          {units.map((unit, index) => (
            <Pressable key={unit.id || unit.label} accessibilityRole="radio" accessibilityState={{ checked: selectedUnit === index }} accessibilityLabel={`${unit.label}, ₹${unit.price}`} onPress={() => chooseUnit(index)} style={[styles.unitChip, selectedUnit === index && styles.unitChipActive]}>
              <View style={styles.unitChipTop}><Text style={[styles.unitLabel, selectedUnit === index && styles.unitLabelActive]}>{unit.label}</Text>{selectedUnit === index ? <Feather name="check-circle" size={15} color="#0D7163" /> : null}</View>
              <Text style={[styles.unitPrice, selectedUnit === index && styles.unitLabelActive]}>₹{unit.price}</Text>
            </Pressable>
          ))}
        </ScrollView>
        </View> : null}
        {product.deliveryTime ? <View style={styles.fulfilmentRow}>
          <View style={styles.fulfilmentIcon}><Feather name="truck" size={19} color="#0D7163" /></View>
          <View style={styles.fulfilmentCopy}><Text style={styles.fulfilmentTitle}>Delivery in {product.deliveryTime}</Text><Text style={styles.fulfilmentSubtitle}>Delivery charges calculated at checkout</Text></View>
        </View> : null}
        <View style={styles.aboutCard}>
          <Text style={styles.sectionMini}>About this product</Text>
          {description ? <Text numberOfLines={4} style={styles.description}>{description}</Text> : null}
          <View style={styles.productFacts}>
            <View style={styles.factItem}><Text style={styles.factLabel}>Pack size</Text><Text style={styles.factValue}>{activeUnit.label}</Text></View>
            {product.countryOfOrigin ? <View style={styles.factItem}><Text style={styles.factLabel}>Country of origin</Text><Text style={styles.factValue}>{product.countryOfOrigin}</Text></View> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="View all product details" onPress={() => setDetailsOpen(true)} style={styles.detailsLink}><Text style={styles.viewDetailsText}>View all product details</Text><Feather name="arrow-right" size={16} color="#0D7163" /></Pressable>
        </View>
        <View style={styles.ratingSummaryCard}>
          <View style={styles.ratingSummaryTop}>
            <View style={styles.reviewHeadingCopy}>
              <Text style={styles.sectionMini}>Ratings & reviews</Text>
              <Text style={styles.body}>{reviews.length || product.totalReviews || 0} reviews</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>{rating > 0 ? `${rating} ★` : "New"}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Write a review" onPress={() => setReviewOpen(true)} style={styles.writeReviewLink}><Text style={styles.addReviewText}>Write a review</Text></Pressable>
          </View>
          {!reviews.length ? <Text style={styles.body}>No written reviews yet.</Text> : null}
        </View>
        {reviews.length ? <View style={styles.reviewList}>
          {reviews.slice(0, 1).map((review) => <ReviewCard key={review.id} review={review} />)}
        </View> : null}
        {reviews.length > 1 ? (
          <Pressable onPress={() => navigation.navigate("ProductReviews", { productId })} style={styles.viewMoreReviews}>
            <Text style={styles.viewMoreReviewsText}>View all reviews</Text>
          </Pressable>
        ) : null}

        {similar.length ? (
          <View style={styles.recommendationSection}>
            <Text style={[styles.sectionMini, { marginHorizontal: 16 }]}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
              {similar.map((item) => <ProductCard key={item.id} home product={item} onPress={() => navigation.push("ProductDetails", { productId: item.id })} />)}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.purchaseBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.purchaseCopy}>
          <Text style={styles.purchaseWeight}>{activeUnit.label}</Text>
          <View style={styles.purchasePriceRow}>
            <Text style={styles.purchasePrice}>₹{activeUnit.price}</Text>
            {savings > 0 ? <Text style={styles.purchaseMrp}>₹{activeUnit.mrp}</Text> : null}
          </View>
        </View>
        {cartQty ? (
          <View style={styles.purchaseStepper}>
            <Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" onPress={() => dispatch(decrementCart(removeCartPayload))} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>−</Text></Pressable>
            <Text style={styles.purchaseQty}>{cartQty}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" onPress={() => dispatch(addToCart(addCartPayload))} style={styles.purchaseStepButton}><Text style={styles.purchaseStepText}>+</Text></Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="Add to cart" onPress={() => dispatch(addToCart(addCartPayload))} style={styles.purchaseAddButton}>
            <Text style={styles.purchaseAddText}>Add to cart</Text>
            <Feather name="plus" size={18} color="#FFFFFF" />
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
      {zoomOpen ? <ProductImageViewer images={gallery} initialIndex={activeImage} productName={product.name} onClose={() => setZoomOpen(false)} onImageChange={(index) => {
        setActiveImage(index);
        galleryRef.current?.scrollTo({ x: index * galleryWidth, animated: false });
      }} /> : null}
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
  const description = product.description || product.desc || "No description available.";
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
              <SafeRemoteImage uri={image} imageSize={1000} style={styles.sheetThumbPhoto} fallback={image} fallbackStyle={styles.sheetThumbEmoji} />
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
              <SafeRemoteImage uri={image} imageSize={1000} style={styles.packImage} resizeMode="contain" fallback={image} fallbackStyle={styles.packEmoji} />
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
                {unit.mrp > unit.price ? <Text style={styles.purchaseMrp}>₹{unit.mrp}</Text> : null}
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
  cartCountBadge: { position: "absolute", top: 2, right: 2, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 9, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#0D7163", alignItems: "center", justifyContent: "center" },
  cartCountText: { fontSize: 8, fontWeight: "800", color: "#FFFFFF" },
  galleryShare: { position: "absolute", right: 16, bottom: 6, width: 44, height: 44, borderRadius: 22, backgroundColor: "#F4F7F5", alignItems: "center", justifyContent: "center" },
  galleryThumbnails: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 8, backgroundColor: "#FFFFFF" },
  galleryThumb: { width: 44, height: 44, padding: 4, borderRadius: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EAE6" },
  galleryThumbActive: { borderColor: "#0D7163", backgroundColor: "#F1F8F4" },
  galleryThumbPhoto: { width: "100%", height: "100%", borderRadius: 5 },
  packOptions: { gap: 9, paddingHorizontal: 16, paddingBottom: 16 },
  stockUnavailable: { color: colors.danger },
  fulfilmentRow: { marginHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#EDF1EE", flexDirection: "row", alignItems: "center", gap: 10 },
  fulfilmentIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EDF6F0", justifyContent: "center", alignItems: "center" },
  fulfilmentCopy: { flex: 1, gap: 4 },
  fulfilmentTitle: { color: "#2C4133", fontSize: 12, fontWeight: "700" },
  fulfilmentSubtitle: { color: "#7B867E", fontSize: 10 },
  reviewHeadingCopy: { flex: 1, minWidth: 0, gap: 4 },
  writeReviewLink: { minHeight: 44, justifyContent: "center", paddingLeft: 2 },
  recommendationSection: { borderTopWidth: 8, borderTopColor: "#F4F6F4", paddingTop: 16, gap: 12 },
  recommendations: { paddingHorizontal: 8, paddingBottom: 8, gap: 4 },
  detailHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, gap: 2, backgroundColor: "#FFFFFF" },
  detailHeaderTitle: { flex: 1, color: "#25372B", fontSize: 15, fontWeight: "700", marginLeft: 3 },
  galleryHint: { position: "absolute", left: 18, bottom: 14, flexDirection: "row", alignItems: "center", gap: 5 },
  galleryHintText: { color: "#6E8177", fontSize: 10 },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between" },
  brandName: { flex: 1, color: "#728276", fontSize: 11, fontWeight: "500" },
  inlineRating: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#EAF5EF", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  inlineRatingText: { color: "#0D7163", fontSize: 10, fontWeight: "700" },
  stockText: { color: "#A66B22", fontSize: 10 },
  savingsBadge: { color: "#0D7163", fontSize: 11, fontWeight: "700", backgroundColor: "#EDF7F0", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, overflow: "hidden" },
  packSection: { paddingTop: 2, gap: 10 },
  unitChipTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  aboutCard: { borderTopWidth: 8, borderTopColor: "#F4F6F4", padding: 16, paddingBottom: 4, gap: 12, backgroundColor: "#FFFFFF" },
  description: { color: "#6D7A70", fontSize: 12, lineHeight: 19 },
  productFacts: { gap: 0 },
  factItem: { flexDirection: "row", alignItems: "flex-start", gap: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#F0F3F0" },
  factLabel: { width: "40%", color: "#849086", fontSize: 11 },
  factValue: { flex: 1, color: "#3F5144", fontSize: 12, fontWeight: "500" },
  detailsLink: { minHeight: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewList: { paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  detailRoot: { flex: 1, backgroundColor: "#FFFFFF" },
  detailContent: { backgroundColor: "#FFFFFF" },
  heroGallery: { backgroundColor: "#FFFFFF", overflow: "hidden" },
  heroSlide: { alignItems: "center", justifyContent: "center", paddingBottom: 24 },
  heroPhoto: { width: "80%", height: "90%" },
  heroEmoji: { fontSize: 126 },
  roundAction: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  viewDetailsText: { color: "#0D7163", fontSize: 12, fontWeight: "700" },
  summaryCard: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 7 },
  ratingSummaryCard: { borderTopWidth: 8, borderTopColor: "#F4F6F4", backgroundColor: "#FFFFFF", padding: 16, gap: 10 },
  ratingSummaryTop: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  ratingBadge: { minWidth: 46, height: 28, borderRadius: 6, backgroundColor: "#EDF7F0", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  ratingBadgeText: { color: "#0D7163", fontSize: 12, fontWeight: "700" },
  addReviewText: { color: "#0D7163", fontSize: 11, fontWeight: "700" },
  viewMoreReviews: { marginHorizontal: 12, height: 40, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  viewMoreReviewsText: { color: colors.primaryDark, fontSize: type.subheading, fontWeight: "900" },
  productTitle: { color: "#1D3023", fontSize: 21, lineHeight: 27, letterSpacing: -0.4, fontWeight: "700" },
  weightRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 9 },
  productWeight: { color: "#6E7C72", fontSize: 12, fontWeight: "500" },
  priceLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 2 },
  productPrice: { color: "#1D3023", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  productMrp: { color: "#8A978D", fontSize: 12, textDecorationLine: "line-through" },
  purchaseBar: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 76, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E3EBE5", paddingTop: 10, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12, zIndex: 30 },
  purchaseCopy: { flex: 1, minWidth: 0 },
  purchaseWeight: { color: "#748379", fontSize: 11, fontWeight: "600" },
  purchasePriceRow: { flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 1 },
  purchasePrice: { color: "#223C2C", fontSize: 21, fontWeight: "800" },
  purchaseMrp: { color: "#8A978D", fontSize: 11, textDecorationLine: "line-through" },
  taxText: { color: "#7A887E", fontSize: 10, marginTop: 1 },
  purchaseAddButton: { width: 156, height: 46, borderRadius: 10, backgroundColor: "#0D7163", flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "center" },
  purchaseAddText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  purchaseStepper: { width: 156, height: 46, borderRadius: 10, backgroundColor: "#0D7163", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5 },
  purchaseStepButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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
  thumbnailEmoji: { fontSize: 26 },
  sectionMini: { color: "#26392C", fontWeight: "700", fontSize: 15 },
  unitChip: { width: 112, borderRadius: 10, borderWidth: 1, borderColor: "#E0E7E1", padding: 11, backgroundColor: "#FFFFFF" },
  unitChipActive: { backgroundColor: "#F0F8F3", borderColor: "#0D7163" },
  unitLabel: { flexShrink: 1, color: "#304C3C", fontWeight: "700", fontSize: 12 },
  unitPrice: { color: "#425B49", marginTop: 6, fontWeight: "700", fontSize: 13 },
  unitLabelActive: { color: "#0D7163" },
  body: { color: "#748176", lineHeight: 19, fontSize: 12 },
  reviewCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, gap: 7 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  reviewName: { color: colors.text, fontWeight: "900", fontSize: type.subheading },
  reviewStars: { color: "#E9B600", fontSize: type.body, fontWeight: "900" },
  date: { color: colors.muted, fontSize: type.body },
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
});
