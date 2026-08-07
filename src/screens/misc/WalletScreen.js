import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { addWalletMoney } from "../../store/slices/userSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const quickAmounts = [250, 500, 1000, 2000];

export default function WalletScreen({ navigation }) {
  const wallet = useSelector((state) => state.user.wallet);
  const [amount, setAmount] = React.useState("500");
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const addMoney = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Enter amount", "Please enter a valid amount to add.");
      return;
    }
    dispatch(addWalletMoney(value));
    Alert.alert("Money added", `₹${value} added to Fresh Money.`);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("Tabs", { screen: "Home" }))} style={styles.iconCircle}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Fresh Money</Text>
          <View style={styles.iconCircle}>
            <Feather name="shield" size={20} color={colors.primaryDark} />
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={28} color="#5B311B" />
            </View>
            <View style={styles.balanceCopy}>
              <Text style={styles.balanceLabel}>Available balance</Text>
              <Text style={styles.balance}>₹{wallet}</Text>
            </View>
          </View>
          <View style={styles.balanceFooter}>
            <Feather name="zap" size={15} color="#5B311B" />
            <Text style={styles.balanceNote}>Use wallet money for faster grocery checkout</Text>
          </View>
        </View>

        <View style={styles.addPanel}>
          <Text style={styles.sectionTitle}>Add money</Text>
          <Text style={styles.sectionSub}>Choose an amount or enter your own</Text>
          <View style={styles.inputRow}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.amountGrid}>
            {quickAmounts.map((item) => (
              <Pressable key={item} onPress={() => setAmount(String(item))} style={[styles.amountChip, amount === String(item) && styles.amountChipActive]}>
                <Text style={[styles.amountText, amount === String(item) && styles.amountTextActive]}>₹{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={addMoney} style={styles.addButton}>
            <Ionicons name="wallet-outline" size={19} color="#fff" />
            <Text style={styles.addButtonText}>Add ₹{Number(amount) || 0}</Text>
          </Pressable>
        </View>

        <View style={styles.perksRow}>
          <WalletPerk icon="lock" title="Secure" text="Protected payment flow" />
          <WalletPerk icon="refresh-cw" title="Refunds" text="Credits arrive faster" />
          <WalletPerk icon="clock" title="Quick" text="One-tap checkout" />
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          {[
            ["Cashback credited", "+₹40", "Jul 6"],
            ["Order payment", "-₹284", "Jul 5"],
            ["Refund processed", "+₹119", "Jul 4"]
          ].map(([label, value, date]) => (
            <View key={label} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Feather name={value.startsWith("+") ? "arrow-down-left" : "arrow-up-right"} size={18} color={value.startsWith("+") ? colors.primaryDark : colors.orange} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityTitle}>{label}</Text>
                <Text style={styles.activityDate}>{date}</Text>
              </View>
              <Text style={[styles.activityValue, value.startsWith("+") && styles.credit]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WalletPerk({ icon, title, text }) {
  return (
    <View style={styles.perk}>
      <Feather name={icon} size={19} color={colors.primaryDark} />
      <Text style={styles.perkTitle}>{title}</Text>
      <Text style={styles.perkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FB" },
  content: { padding: 12, gap: 12 },
  header: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  balanceCard: { borderRadius: 8, backgroundColor: "#FFD35A", padding: 16, gap: 14 },
  balanceTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  walletIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.55)", alignItems: "center", justifyContent: "center" },
  balanceCopy: { flex: 1 },
  balanceLabel: { color: "#5B311B", fontSize: type.subheading, fontWeight: "800" },
  balance: { color: "#2A170B", fontSize: 34, fontWeight: "900", marginTop: 2 },
  balanceFooter: { minHeight: 34, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.45)", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 },
  balanceNote: { color: "#5B311B", fontSize: type.body, fontWeight: "800", flex: 1 },
  addPanel: { borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, padding: 14, gap: 10 },
  sectionTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  sectionSub: { color: colors.muted, fontSize: type.body, fontWeight: "700" },
  inputRow: { height: 54, borderRadius: 8, backgroundColor: "#F7F8FA", borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  rupee: { color: colors.text, fontSize: 24, fontWeight: "900", marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 24, fontWeight: "900" },
  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amountChip: { width: "23%", height: 40, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F8FA" },
  amountChipActive: { borderColor: colors.primary, backgroundColor: "#EAFBEF" },
  amountText: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  amountTextActive: { color: colors.primaryDark },
  addButton: { height: 48, borderRadius: 8, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  addButtonText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" },
  perksRow: { flexDirection: "row", gap: 8 },
  perk: { flex: 1, minHeight: 96, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, padding: 10, gap: 5 },
  perkTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  perkText: { color: colors.muted, fontSize: type.body, lineHeight: 14 },
  activityCard: { borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, padding: 12, gap: 4 },
  activityRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, borderTopColor: colors.faint },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center" },
  activityCopy: { flex: 1 },
  activityTitle: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  activityDate: { color: colors.muted, fontSize: type.body, marginTop: 1 },
  activityValue: { color: colors.orange, fontSize: type.subheading, fontWeight: "900" },
  credit: { color: colors.primaryDark }
});
