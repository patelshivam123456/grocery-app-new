import React from "react";
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import SafeRemoteImage from "../../components/SafeRemoteImage";
import { selectUserOrders } from "../../store/selectors";
import { formatOrderDate, orderStatus } from "../../services/orderHistory";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_TOPICS, searchSupportFaqs, supportEmailUrl, supportOrderReference } from "../../services/support";

export default function SupportScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const orders = useSelector(selectUserOrders);
  const recentOrder = React.useMemo(() => orders.find((order) => order.id === route?.params?.orderId) || [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0], [orders, route?.params?.orderId]);
  const [query, setQuery] = React.useState("");
  const [topic, setTopic] = React.useState(null);
  const [openFaq, setOpenFaq] = React.useState(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [contactTopic, setContactTopic] = React.useState(null);
  const [contactOrderId, setContactOrderId] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [openingEmail, setOpeningEmail] = React.useState(false);
  const [contactError, setContactError] = React.useState("");
  const faqs = React.useMemo(() => searchSupportFaqs(query, topic), [query, topic]);
  const attachedOrder = orders.find((order) => order.id === contactOrderId);
  const status = recentOrder ? orderStatus(recentOrder.status) : null;
  const firstLine = recentOrder?.lines?.[0];
  const openOrders = () => navigation.navigate("Tabs", { screen: "Orders", params: { screen: "OrdersHome" } });
  const goBack = () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Tabs", { screen: "Profile" });
  const openContact = (order = null) => {
    setContactOrderId(order?.id || null);
    setContactTopic(order ? "orders" : topic);
    setMessage("");
    setError("");
    setComposerOpen(true);
  };
  const continueInEmail = async () => {
    if (!message.trim()) { setError("Please add a short description of your issue."); return; }
    if (openingEmail) return;
    setOpeningEmail(true);
    setError("");
    try { await Linking.openURL(supportEmailUrl({ topic: contactTopic, message, order: attachedOrder })); }
    catch { setError(`We couldn't open your email app. You can email ${SUPPORT_EMAIL} directly.`); }
    finally { setOpeningEmail(false); }
  };
  const callSupport = async () => {
    try { setContactError(""); await Linking.openURL(`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`); }
    catch { setContactError("We couldn't open the phone app. Please use email support."); }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}><Feather name="arrow-left" size={22} color="#233E2E" /></Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>Help & support</Text>
        <View style={styles.headerMark}><Feather name="life-buoy" size={21} color="#0D7163" /></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>How can we help?</Text>
          <Text style={styles.introCopy}>Find answers or get help with your order.</Text>
          <View style={styles.search}><Feather name="search" size={18} color="#7B8C80" /><TextInput accessibilityLabel="Search help topics" value={query} onChangeText={(text) => { setQuery(text); setOpenFaq(null); }} placeholder="Search orders, payments and more" placeholderTextColor="#94A097" autoCorrect={false} returnKeyType="search" style={styles.searchInput} />{query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear help search" onPress={() => setQuery("")} style={styles.clearButton}><Feather name="x" size={17} color="#7B8C80" /></Pressable> : null}</View>
        </View>

        {!query.trim() ? <>
        <View style={styles.section}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Help with an order</Text><Pressable accessibilityRole="button" onPress={openOrders} style={styles.textLink}><Text style={styles.linkText}>View orders</Text><Feather name="chevron-right" size={14} color="#0D7163" /></Pressable></View>
          {recentOrder ? <Pressable accessibilityRole="button" accessibilityLabel={`Get help with order ${supportOrderReference(recentOrder)}`} onPress={() => openContact(recentOrder)} style={styles.orderCard}>
            <View style={styles.orderMain}><View style={styles.orderImage}><SafeRemoteImage uri={firstLine?.unit?.imageGallery?.[0] || firstLine?.product?.imageGallery?.[0] || firstLine?.product?.image} style={styles.orderPhoto} resizeMode="contain" fallback="🛍️" fallbackStyle={styles.orderFallback} /></View><View style={styles.flex}><Text style={[styles.orderStatus, { color: status.color }]}>{status.label}</Text><Text numberOfLines={1} style={styles.orderNames}>{(recentOrder.lines || []).map((line) => line.product?.name).filter(Boolean).join(", ") || `Order #${recentOrder.id}`}</Text><Text numberOfLines={1} style={styles.smallText}>{formatOrderDate(recentOrder.createdAt)}</Text></View></View>
            <View style={styles.orderAction}><Text style={styles.orderActionText}>Get help with this order</Text><Feather name="arrow-right" size={16} color="#0D7163" /></View>
          </Pressable> : <Pressable accessibilityRole="button" onPress={openOrders} style={styles.noOrder}><View style={styles.topicIcon}><Feather name="package" size={21} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.rowTitle}>Looking for an order?</Text><Text style={styles.smallText}>Open your orders to find it.</Text></View><Feather name="chevron-right" size={17} color="#0D7163" /></Pressable>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse help topics</Text>
          <View style={styles.topics}>{SUPPORT_TOPICS.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: topic === item.id }} onPress={() => { setTopic(topic === item.id ? null : item.id); setOpenFaq(null); }} style={[styles.topicCard, topic === item.id && styles.topicActive]}><View style={styles.topicIcon}><Feather name={item.icon} size={20} color="#0D7163" /></View><Text style={styles.topicTitle}>{item.title}</Text><Text style={styles.topicSubtitle}>{item.subtitle}</Text></Pressable>)}</View>
        </View>

        </> : null}
        <View style={styles.section}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{query.trim() ? "Search results" : topic ? SUPPORT_TOPICS.find((item) => item.id === topic)?.title : "Frequently asked questions"}</Text>{topic || query ? <Pressable accessibilityRole="button" onPress={() => { setTopic(null); setQuery(""); setOpenFaq(null); }} style={styles.textLink}><Text style={styles.linkText}>Show all</Text></Pressable> : null}</View>
          <View style={styles.faqList}>{faqs.map((faq, index) => <View key={faq.id} style={index > 0 && styles.faqDivider}><Pressable accessibilityRole="button" accessibilityState={{ expanded: openFaq === faq.id }} onPress={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} style={styles.faqQuestion}><Text style={styles.faqTitle}>{faq.question}</Text><Feather name={openFaq === faq.id ? "chevron-up" : "chevron-down"} size={17} color="#83978A" /></Pressable>{openFaq === faq.id ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}</View>)}{!faqs.length ? <View style={styles.noResults}><Feather name="search" size={23} color="#8CA194" /><Text style={styles.rowTitle}>No matching answers</Text><Text style={styles.smallText}>Try another search or contact us below.</Text></View> : null}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.contactHeading}><Text style={styles.sectionTitle}>Still need a hand?</Text><Text style={styles.smallText}>Tell us what happened so we can help.</Text></View>
          <View style={styles.contactCard}><Pressable accessibilityRole="button" accessibilityLabel="Contact email support" onPress={() => openContact()} style={styles.contactRow}><View style={styles.contactIcon}><Feather name="mail" size={22} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.rowTitle}>Email support</Text><Text style={styles.smallText}>Describe your issue in a message</Text></View><Feather name="chevron-right" size={18} color="#0D7163" /></Pressable>{SUPPORT_PHONE ? <Pressable accessibilityRole="button" accessibilityLabel="Call customer support" onPress={callSupport} style={[styles.contactRow, styles.faqDivider]}><View style={styles.contactIcon}><Feather name="phone" size={20} color="#0D7163" /></View><View style={styles.flex}><Text style={styles.rowTitle}>Call support</Text><Text style={styles.smallText}>{SUPPORT_PHONE}</Text></View><Feather name="arrow-up-right" size={18} color="#0D7163" /></Pressable> : null}</View>
          {contactError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{contactError}</Text> : null}
        </View>
      </ScrollView>

      <Modal visible={composerOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setComposerOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss support message" onPress={() => setComposerOpen(false)} style={styles.dim} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), marginTop: insets.top + 16 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}><View style={styles.flex}><Text style={styles.sheetTitle}>Contact support</Text><Text style={styles.smallText}>Tell us how we can help.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close support message" onPress={() => setComposerOpen(false)} style={styles.iconButton}><Feather name="x" size={22} color="#52715D" /></Pressable></View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
              <Text style={styles.fieldLabel}>What do you need help with?</Text>
              <View style={styles.topicChips}>{[...SUPPORT_TOPICS, { id: null, title: "Something else" }].map((item) => <Pressable key={item.id || "general"} accessibilityRole="button" accessibilityState={{ selected: contactTopic === item.id }} onPress={() => setContactTopic(item.id)} style={[styles.topicChip, contactTopic === item.id && styles.topicChipActive]}><Text style={[styles.topicChipText, contactTopic === item.id && styles.topicChipTextActive]}>{item.title}</Text></Pressable>)}</View>
              {attachedOrder ? <View style={styles.attachedOrder}><Feather name="package" size={17} color="#0D7163" /><Text numberOfLines={2} style={styles.attachedLabel}>Order #{supportOrderReference(attachedOrder)}</Text><Pressable accessibilityRole="button" accessibilityLabel="Remove order from support message" hitSlop={6} onPress={() => setContactOrderId(null)} style={styles.clearButton}><Feather name="x" size={16} color="#7B8C80" /></Pressable></View> : null}
              <Text style={styles.fieldLabel}>How can we help?</Text>
              <TextInput accessibilityLabel="Describe your support issue" value={message} onChangeText={(text) => { setMessage(text); setError(""); }} placeholder="Tell us what happened. Include the item name or payment reference if relevant." placeholderTextColor="#9AAA9E" multiline maxLength={2000} textAlignVertical="top" style={[styles.messageInput, error && styles.messageInputError]} />
              {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
              <Text selectable style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
            </ScrollView>
            <View style={styles.sheetFooter}><Pressable accessibilityRole="button" disabled={openingEmail} onPress={continueInEmail} style={[styles.emailButton, openingEmail && styles.disabled]}><Text style={styles.emailButtonText}>{openingEmail ? "Opening email…" : "Continue in email"}</Text><Feather name="arrow-up-right" size={18} color="#FFFFFF" /></Pressable><Text style={styles.emailHint}>Review and send your message in your email app.</Text></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#EEF3EF" },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#273F30", fontSize: 18, fontWeight: "700" },
  headerMark: { width: 38, height: 38, borderRadius: 13, marginRight: 8, backgroundColor: "#EDF7F0", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, gap: 22, backgroundColor: "#FAFCFA" },
  intro: { paddingTop: 20, gap: 8 },
  introTitle: { fontSize: 25, fontWeight: "800", letterSpacing: -0.6, color: "#1E432E" },
  introCopy: { fontSize: 12, color: "#819385", lineHeight: 18 },
  search: { height: 46, marginTop: 8, borderWidth: 1, borderColor: "#E1EAE3", borderRadius: 13, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#FFFFFF" },
  searchInput: { flex: 1, minWidth: 0, color: "#365C43", fontSize: 12, height: "100%", paddingVertical: 0 },
  clearButton: { width: 30, height: 32, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  section: { gap: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sectionTitle: { flexShrink: 1, color: "#314F3A", fontSize: 15, fontWeight: "700" },
  textLink: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 2 },
  linkText: { color: "#0D7163", fontSize: 11, fontWeight: "700" },
  smallText: { color: "#89998E", fontSize: 10, lineHeight: 16 },
  orderCard: { borderRadius: 15, borderWidth: 1, borderColor: "#DBEAE0", backgroundColor: "#FFFFFF", overflow: "hidden" },
  orderMain: { padding: 13, flexDirection: "row", alignItems: "center", gap: 11 },
  orderImage: { width: 48, height: 54, backgroundColor: "#F5F9F5", borderRadius: 9, padding: 5, alignItems: "center", justifyContent: "center" },
  orderPhoto: { width: "100%", height: "100%", borderRadius: 5 },
  orderFallback: { fontSize: 25 },
  orderStatus: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  orderNames: { color: "#526C5A", fontSize: 12, fontWeight: "500", marginBottom: 3 },
  orderAction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#EFF7F2", paddingHorizontal: 13, paddingVertical: 11 },
  orderActionText: { color: "#0D7163", fontSize: 12, fontWeight: "700" },
  noOrder: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3EBE4", borderRadius: 14 },
  topics: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  topicCard: { width: "48.5%", padding: 13, borderRadius: 14, borderWidth: 1, borderColor: "#E3EBE4", backgroundColor: "#FFFFFF", gap: 6 },
  topicActive: { borderColor: "#0D7163", backgroundColor: "#F0F8F3" },
  topicIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EDF6F0", alignItems: "center", justifyContent: "center", marginBottom: 3 },
  topicTitle: { color: "#3C5C46", fontSize: 12, fontWeight: "700" },
  topicSubtitle: { color: "#8B9C8F", fontSize: 9, lineHeight: 14 },
  faqList: { borderRadius: 14, borderWidth: 1, borderColor: "#E4ECE5", backgroundColor: "#FFFFFF", paddingHorizontal: 13 },
  faqDivider: { borderTopWidth: 1, borderTopColor: "#EDF2ED" },
  faqQuestion: { minHeight: 54, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  faqTitle: { flex: 1, color: "#526C5B", fontSize: 12, lineHeight: 18, fontWeight: "500" },
  faqAnswer: { color: "#89998E", fontSize: 12, lineHeight: 20, paddingBottom: 15 },
  noResults: { minHeight: 132, alignItems: "center", justifyContent: "center", padding: 12, gap: 8 },
  rowTitle: { color: "#3C5D46", fontSize: 12, fontWeight: "700", marginBottom: 3 },
  contactHeading: { gap: 4 },
  contactCard: { borderRadius: 14, borderWidth: 1, borderColor: "#E2EBE4", backgroundColor: "#FFFFFF", paddingHorizontal: 13 },
  contactRow: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 12 },
  contactIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#EAF5EF", alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(16,36,23,0.48)" },
  sheet: { maxHeight: "90%", borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#FFFFFF", overflow: "hidden" },
  sheetHandle: { height: 4, width: 36, backgroundColor: "#DDE7DF", borderRadius: 2, alignSelf: "center", marginTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  sheetTitle: { color: "#2B4D36", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  sheetScroll: { flexShrink: 1 },
  sheetContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16, gap: 12 },
  fieldLabel: { color: "#54725E", fontSize: 12, fontWeight: "600" },
  topicChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: { minHeight: 34, paddingHorizontal: 11, borderRadius: 17, borderWidth: 1, borderColor: "#E1EBE3", alignItems: "center", justifyContent: "center" },
  topicChipActive: { backgroundColor: "#EDF7F1", borderColor: "#0D7163" },
  topicChipText: { color: "#8A9E90", fontSize: 10, fontWeight: "600" },
  topicChipTextActive: { color: "#0D7163" },
  attachedOrder: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 11, backgroundColor: "#F1F7F3" },
  attachedLabel: { flex: 1, color: "#547660", fontSize: 11, fontWeight: "600" },
  messageInput: { minHeight: 128, borderRadius: 13, borderWidth: 1, borderColor: "#DEEBE2", padding: 13, color: "#3D634A", fontSize: 13, lineHeight: 20 },
  messageInputError: { borderColor: "#BC7676" },
  emailAddress: { color: "#8B9F91", fontSize: 11 },
  error: { color: "#AC5C5C", fontSize: 11, lineHeight: 17 },
  sheetFooter: { paddingHorizontal: 18, paddingTop: 8, gap: 9 },
  emailButton: { minHeight: 46, borderRadius: 12, backgroundColor: "#0D7163", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  emailButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  emailHint: { color: "#95A79A", fontSize: 10, textAlign: "center" },
  disabled: { opacity: 0.6 }
});
