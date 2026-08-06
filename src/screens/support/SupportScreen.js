import React, { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { faqs } from "../../data/mockData";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function SupportScreen() {
  const [ticket, setTicket] = useState("");
  const [tickets, setTickets] = useState(["Refund for missing item", "Late delivery follow-up"]);
  return (
    <Screen>
      <Text style={styles.title}>Help center</Text>
      {faqs.map((faq) => <View key={faq} style={styles.card}><Text style={styles.name}>{faq}</Text><Text style={styles.sub}>Tap chat support for a quick mock resolution.</Text></View>)}
      <View style={styles.chat}>
        <Text style={styles.name}>Chat support</Text>
        <Text style={styles.bubble}>Hi, I am Just Harvst Assist. Tell me what went wrong with your order.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.name}>Raise ticket</Text>
        <TextInput value={ticket} onChangeText={setTicket} placeholder="Describe your issue" style={styles.input} />
        <AppButton title="Submit Ticket" onPress={() => { if (ticket) { setTickets([ticket, ...tickets]); setTicket(""); } }} />
      </View>
      <AppButton title="Call Support" variant="outline" onPress={() => Linking.openURL("tel:1800000000")} />
      <Text style={styles.title}>Past tickets</Text>
      {tickets.map((item, index) => <Text key={`${item}-${index}`} style={styles.ticket}>{item} • Open</Text>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, gap: 8 },
  name: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  chat: { backgroundColor: "#EAF7EF", borderRadius: 8, padding: 14, gap: 10 },
  bubble: { backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text, fontSize: type.body, lineHeight: 15 },
  input: { minHeight: 68, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, padding: 10, fontSize: type.body },
  ticket: { color: colors.text, backgroundColor: colors.surface, borderRadius: 8, padding: 10, fontSize: type.body }
});
