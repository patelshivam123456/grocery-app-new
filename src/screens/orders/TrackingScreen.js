import React from "react";
import { Feather } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function TrackingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [timelineOpen, setTimelineOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(true);
  const order = useSelector((state) => {
    if (!state.auth.isLoggedIn) return null;
    const mobile = state.auth.mobile;
    return state.orders.items.find((item) => item.id === route.params?.orderId && item.userMobile === mobile)
      || state.orders.items.find((item) => item.userMobile === mobile && item.status !== "Cancelled");
  });

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Orders", { screen: "OrdersHome" }));
  const goHome = () => navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
  const callSupport = () => Linking.openURL("tel:1800000000");
  const chatSupport = () => Linking.openURL("sms:1800000000");

  if (!order) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Feather name="package" size={34} color={colors.primaryDark} /></View>
          <Text style={styles.emptyTitle}>No active order</Text>
          <Text style={styles.emptySub}>Place an order to track live status.</Text>
          <Pressable onPress={goBack} style={styles.primaryButton}><Text style={styles.primaryText}>Back to orders</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const address = order.address;
  const payment = order.paymentMethod || "UPI";
  const isDelivered = order.status === "Delivered";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconBtn}><Feather name="x" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={callSupport} style={styles.iconBtn}><Feather name="phone" size={18} color={colors.text} /></Pressable>
          <Pressable onPress={chatSupport} style={styles.iconBtn}><Feather name="message-square" size={18} color={colors.text} /></Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.mapCard}>
          <View style={styles.mapGrid}>
            <View style={[styles.road, styles.roadOne]} />
            <View style={[styles.road, styles.roadTwo]} />
            <View style={[styles.road, styles.roadThree]} />
            <View style={styles.routeLine} />
            <View style={styles.storePin}><Feather name="shopping-bag" size={17} color="#fff" /></View>
            <View style={styles.homePin}><Feather name="home" size={17} color="#fff" /></View>
            <View style={styles.riderBubble}><Text style={styles.rider}>🛵</Text></View>
            <View style={styles.timeBubble}><Text style={styles.timeText}>{isDelivered ? "Delivered" : "Will arrive in 27 min"}</Text></View>
            <View style={styles.selectedBubble}><Text style={styles.selectedText}>Selected location</Text></View>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.orderHeader}>
            <View style={styles.storeAvatar}><Text style={styles.storeEmoji}>🛒</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Grocery Delivery</Text>
              <Text style={styles.serviceSub}>{new Date(order.createdAt).toLocaleString([], { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
            </View>
            <Pressable onPress={callSupport} style={styles.callCircle}><Feather name="phone" size={18} color={colors.text} /></Pressable>
            <Pressable onPress={chatSupport} style={styles.callCircle}><Feather name="message-square" size={18} color={colors.text} /></Pressable>
          </View>

          <Text style={styles.sectionTitle}>Service Timeline</Text>
          <View style={styles.timeline}>
            <TimelineItem title="Address" text={`${address?.line1 || "Detected from device GPS"}, ${address?.city || "Nearby area"}`} active />
            <TimelineItem title="Order Booked" text={new Date(order.createdAt).toLocaleString([], { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })} active />
            <TimelineItem title="Scheduled" text="Delivery in 15 - 30 mins" active />
            {timelineOpen ? (
              <>
                <TimelineItem title="Packing started" text="Your groceries are being checked and packed" active />
                <TimelineItem title="Rider assigned" text="A delivery partner will start shortly" active />
                <TimelineItem title="Provider accepted the order" text={isDelivered ? "Delivered to selected address" : "Waiting for rider confirmation"} active={isDelivered} muted={!isDelivered} />
              </>
            ) : null}
          </View>

          <Pressable onPress={() => setTimelineOpen((open) => !open)} style={styles.seeMore}>
            <Text style={styles.seeMoreText}>{timelineOpen ? "See Less" : "See More"}</Text>
            <Feather name={timelineOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.primaryDark} />
          </Pressable>

          <View style={styles.divider} />
          <Pressable onPress={() => setDetailsOpen((open) => !open)} style={styles.collapsibleHeader}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Feather name={detailsOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
          </Pressable>
          {detailsOpen ? (
            <>
              <View style={styles.paymentRow}>
                <View style={styles.cardLogo}><Text style={styles.cardText}>{payment.slice(0, 4).toUpperCase()}</Text></View>
                <Text style={styles.masked}>Paid with {payment} •••• {String(order.id).slice(-4)}</Text>
                <Feather name="check-circle" size={17} color={colors.primaryDark} />
              </View>

              <Text style={styles.summaryTitle}>Summary</Text>
              <SummaryRow label="Subtotal" value={`₹${order.total}`} />
              <SummaryRow label="Fees & Estimated Tax" value="₹0" />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={`₹${order.total}`} strong />
            </>
          ) : null}

          <Pressable onPress={goHome} style={styles.outlineButton}>
            <Text style={styles.outlineText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({ title, text, active, muted }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, active && styles.timelineDotActive, muted && styles.timelineDotMuted]} />
        <View style={[styles.timelineLine, muted && styles.timelineLineMuted]} />
      </View>
      <View style={styles.timelineCopy}>
        <Text style={[styles.timelineTitle, muted && styles.mutedTitle]}>{title}</Text>
        <Text style={[styles.timelineText, muted && styles.mutedText]}>{text}</Text>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E6F8E9" },
  header: { minHeight: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff" },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: colors.text, fontSize: type.heading, fontWeight: "900", textAlign: "center" },
  headerActions: { flexDirection: "row", gap: 8 },
  content: { padding: 12 },
  mapCard: { height: 252, borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden", backgroundColor: "#DDF2DD", borderWidth: 1, borderColor: "#C8E6C9" },
  mapGrid: { flex: 1, backgroundColor: "#DDF2DD" },
  road: { position: "absolute", height: 14, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.95)", borderWidth: 1, borderColor: "#C9DFC9" },
  roadOne: { width: 370, top: 84, left: -42, transform: [{ rotate: "-19deg" }] },
  roadTwo: { width: 330, top: 155, left: 30, transform: [{ rotate: "11deg" }] },
  roadThree: { width: 260, top: 112, right: -60, transform: [{ rotate: "73deg" }] },
  routeLine: { position: "absolute", left: "34%", top: 104, width: "32%", height: 5, borderRadius: 3, backgroundColor: colors.primaryDark, transform: [{ rotate: "42deg" }] },
  storePin: { position: "absolute", left: "28%", top: 84, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primaryDark, borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  homePin: { position: "absolute", right: "26%", top: 158, width: 34, height: 34, borderRadius: 17, backgroundColor: "#222", borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  riderBubble: { position: "absolute", left: "53%", top: 113, width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 4 },
  rider: { fontSize: 25 },
  timeBubble: { position: "absolute", left: "43%", top: 52, borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 9, paddingVertical: 5 },
  timeText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  selectedBubble: { position: "absolute", left: "39%", bottom: 36, borderRadius: 10, backgroundColor: "#111", paddingHorizontal: 8, paddingVertical: 5 },
  selectedText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  sheet: { backgroundColor: "#fff", borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderTopWidth: 0, borderColor: "#DDEDDD" },
  orderHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  storeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  storeEmoji: { fontSize: 22 },
  serviceTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  serviceSub: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  callCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", minHeight: 52 },
  timelineRail: { width: 26, alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#C8D3CC", marginTop: 4 },
  timelineDotActive: { backgroundColor: colors.primaryDark },
  timelineDotMuted: { backgroundColor: "#DDE3DF" },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.primaryDark, marginTop: 2 },
  timelineLineMuted: { backgroundColor: "#E6ECE8" },
  timelineCopy: { flex: 1, paddingBottom: 10 },
  timelineTitle: { color: colors.text, fontSize: type.body, fontWeight: "900" },
  timelineText: { color: colors.muted, fontSize: type.body, marginTop: 2 },
  mutedTitle: { color: "#B0B8B2" },
  mutedText: { color: "#C3CAC5" },
  seeMore: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 4 },
  seeMoreText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" },
  divider: { height: 1, backgroundColor: colors.faint },
  collapsibleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paymentRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 10 },
  cardLogo: { width: 42, height: 28, borderRadius: 5, backgroundColor: "#FFF4F0", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFE1D6" },
  cardText: { color: "#E4572E", fontSize: 9, fontWeight: "900" },
  masked: { flex: 1, color: colors.text, fontSize: type.body, fontWeight: "800" },
  summaryTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { color: colors.muted, fontSize: type.body },
  summaryValue: { color: colors.text, fontSize: type.body, fontWeight: "800" },
  summaryStrong: { color: colors.text, fontWeight: "900" },
  outlineButton: { height: 42, borderRadius: 6, borderWidth: 1, borderColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 2 },
  outlineText: { color: colors.primaryDark, fontSize: type.body, fontWeight: "900" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  emptySub: { color: colors.muted, fontSize: type.subheading, textAlign: "center" },
  primaryButton: { height: 42, borderRadius: 8, backgroundColor: colors.primary, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 6 },
  primaryText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" }
});
