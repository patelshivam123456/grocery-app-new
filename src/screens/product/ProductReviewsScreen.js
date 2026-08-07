import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function ProductReviewsScreen({ route, navigation }) {
  const { productId } = route.params;
  const [query, setQuery] = React.useState("");
  const product = useSelector((state) => state.products.items.find((item) => item.id === productId));
  const reviews = useSelector((state) => state.products.reviews?.[productId] || []);
  const filtered = reviews.filter((review) =>
    `${review.name} ${review.text}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" }));

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Ratings & reviews</Text>
          <Text numberOfLines={1} style={styles.sub}>{product?.name}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="Search reviews" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>
        <Text style={styles.count}>{filtered.length} reviews found</Text>
        {filtered.map((review) => <ReviewRow key={review.id} review={review} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReviewRow({ review }) {
  return (
    <View style={styles.card}>
      <View style={styles.reviewTop}>
        <Text style={styles.name}>{review.name}</Text>
        <Text style={styles.stars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</Text>
      </View>
      <Text style={styles.text}>{review.text}</Text>
      <Text style={styles.date}>{review.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FB" },
  header: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  back: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  backText: { color: colors.text, fontSize: 20, lineHeight: 22 },
  title: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  sub: { color: colors.muted, fontSize: type.body },
  content: { padding: 12, gap: 10, paddingBottom: 30 },
  search: { height: 42, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 },
  searchIcon: { color: colors.text, fontSize: 20 },
  searchInput: { flex: 1, color: colors.text, fontSize: type.subheading },
  count: { color: colors.muted, fontSize: type.body, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 10, gap: 6, borderWidth: 1, borderColor: colors.faint },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  name: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  stars: { color: "#E9B600", fontSize: type.body, fontWeight: "900" },
  text: { color: colors.text, lineHeight: 15, fontSize: type.body },
  date: { color: colors.muted, fontSize: type.body }
});
