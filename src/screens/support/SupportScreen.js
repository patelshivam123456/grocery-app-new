import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "../../components/AppButton";
import { faqs } from "../../data/mockData";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function SupportScreen({ navigation }) {
  const [ticket, setTicket] = useState("");
  const [chatText, setChatText] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState(["Refund for missing item", "Late delivery follow-up"]);
  const insets = useSafeAreaInsets();
  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("Tabs", { screen: "Profile" }));
  const submitTicket = () => {
    if (!ticket.trim()) {
      Alert.alert("Describe issue", "Please enter your issue before submitting a ticket.");
      return;
    }
    setTickets([ticket.trim(), ...tickets]);
    setTicket("");
    Alert.alert("Ticket submitted", "Support will get back to you soon.");
  };
  const sendChat = () => {
    if (!chatText.trim()) {
      Alert.alert("Start chat", "Type a message for Just Harvst Assist.");
      return;
    }
    Alert.alert("Chat sent", "Just Harvst Assist received your message.");
    setChatText("");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconCircle}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Customer Support</Text>
        <View style={styles.iconCircle}>
          <Feather name="help-circle" size={20} color={colors.primaryDark} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        <Text style={styles.title}>Help center</Text>
        {faqs.map((faq, index) => (
          <Pressable key={faq} onPress={() => setOpenFaq(openFaq === index ? null : index)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{faq}</Text>
              <Feather name={openFaq === index ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
            </View>
            {openFaq === index ? <Text style={styles.sub}>Chat support can help with this. You can also raise a ticket for order-specific issues.</Text> : null}
          </Pressable>
        ))}
        <View style={styles.chat}>
          <Text style={styles.name}>Chat support</Text>
          <Text style={styles.bubble}>Hi, I am Just Harvst Assist. Tell me what went wrong with your order.</Text>
          <TextInput value={chatText} onChangeText={setChatText} placeholder="Type your message" placeholderTextColor={colors.muted} style={styles.input} />
          <AppButton title="Send Chat" onPress={sendChat} />
        </View>
        <View style={styles.card}>
          <Text style={styles.name}>Raise ticket</Text>
          <TextInput value={ticket} onChangeText={setTicket} placeholder="Describe your issue" placeholderTextColor={colors.muted} multiline style={styles.input} />
          <AppButton title="Submit Ticket" onPress={submitTicket} />
        </View>
        <AppButton title="Call Support" variant="outline" onPress={() => Linking.openURL("tel:1800000000")} />
        <AppButton title="Email Support" variant="outline" onPress={() => Linking.openURL("mailto:support@justharvst.com?subject=Just%20Harvst%20Support")} />
        <Text style={styles.title}>Past tickets</Text>
        {tickets.map((item, index) => <Text key={`${item}-${index}`} style={styles.ticket}>{item} • Open</Text>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FB" },
  header: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.faint },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: colors.text, fontSize: type.heading, fontWeight: "900" },
  content: { padding: 12, gap: 12 },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  chat: { backgroundColor: "#EAF7EF", borderRadius: 8, padding: 14, gap: 10 },
  bubble: { backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text, fontSize: type.body, lineHeight: 15 },
  input: { minHeight: 68, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, padding: 10, fontSize: type.body },
  ticket: { color: colors.text, backgroundColor: colors.surface, borderRadius: 8, padding: 10, fontSize: type.body }
});
