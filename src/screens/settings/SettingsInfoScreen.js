import React from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const pageCopy = {
  PrivacyPolicy: {
    title: "Privacy Policy",
    rows: [
      ["Information we collect", "We use your profile, delivery address, cart, orders, and support details to run grocery ordering and delivery."],
      ["How it is used", "Your data helps us personalize products, process payments, manage refunds, improve support, and keep your account secure."],
      ["Your control", "You can update profile details, manage addresses, and contact support for account or data requests."]
    ]
  },
  TermsConditions: {
    title: "Terms & Conditions",
    rows: [
      ["Orders", "Prices, stock, delivery estimates, and offers can change before checkout. Confirm the final amount before payment."],
      ["Payments and refunds", "Refunds are processed to the original payment method or Fresh Money where applicable."],
      ["Use of app", "Use Just Harvst for personal grocery shopping and keep your account information accurate."]
    ]
  },
  AboutJustHarvst: {
    title: "About Just Harvst",
    rows: [
      ["Fresh groceries", "Just Harvst is built for fast daily grocery delivery with fresh produce, pantry items, dairy, snacks, and household essentials."],
      ["Service promise", "We focus on simple shopping, quick checkout, transparent prices, and helpful customer support."],
      ["Version", "Just Harvst mobile app 1.0"]
    ]
  }
};

export default function SettingsInfoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const page = pageCopy[route?.params?.page] || pageCopy.AboutJustHarvst;
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Settings"));

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconCircle}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{page.title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        {page.rows.map(([title, body]) => (
          <View key={title} style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FB" },
  header: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: colors.text, fontSize: type.heading, fontWeight: "900" },
  headerSpacer: { width: 32 },
  content: { padding: 12, gap: 12 },
  card: { borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, padding: 12, gap: 8 },
  title: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  body: { color: colors.muted, fontSize: type.subheading, lineHeight: 18 }
});
