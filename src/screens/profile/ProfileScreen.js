import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Alert, Image, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import Screen from "../../components/Screen";
import { logout } from "../../store/slices/authSlice";
import { updateProfile } from "../../store/slices/userSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const quickActions = [
  ["Your orders", "package", "Orders"],
  ["Fresh Money", "wallet", "Wallet"],
  ["Need help?", "message-circle", "Support"]
];

const infoRows = [
  ["Address book", "map-pin", "Addresses"],
  ["Bookmarked recipes", "bookmark", null],
  ["Your wishlist", "heart", "Wishlist"],
  ["GST details", "file-text", null],
  ["Settings", "settings", "Settings"],
  ["Edit profile", "edit-2", "EditProfile"]
];

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.user);
  const mobile = useSelector((state) => state.auth.mobile);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [birthdayOpen, setBirthdayOpen] = React.useState(false);
  const [birthday, setBirthday] = React.useState(user.birthday || "");
  const dispatch = useDispatch();
  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" }));
  const open = (route) => {
    if (route === "Orders") navigation.getParent()?.navigate("Orders", { screen: "OrdersHome" });
    else if (route === "Wishlist") navigation.getParent()?.getParent()?.navigate("Wishlist");
    else navigation.navigate(route);
  };
  const saveBirthday = () => {
    if (!birthday.trim()) {
      Alert.alert("Enter birthday", "Please enter your birthday.");
      return;
    }
    dispatch(updateProfile({ birthday: birthday.trim() }));
    setBirthdayOpen(false);
    Alert.alert("Birthday saved", "Your birthday details have been updated.");
  };
  return (
    <Screen style={styles.screen} contentStyle={{ paddingBottom: 28 }}>
      <View style={styles.hero}>
        <Pressable onPress={goBack} style={styles.back}><Feather name="arrow-left" size={23} color={colors.text} /></Pressable>
        <View style={styles.avatarWrap}>
          {user.photo ? <Image source={{ uri: user.photo }} style={styles.photo} /> : <Feather name="user" size={38} color={colors.text} />}
        </View>
        <Text style={styles.name}>{isLoggedIn ? "Your account" : "Login to your account"}</Text>
        <Text style={styles.phone}>{isLoggedIn && mobile ? `+91 ${mobile}` : "Login to see your mobile number"}</Text>
      </View>

      <Pressable onPress={() => setBirthdayOpen(true)} style={styles.birthday}>
        <View>
          <Text style={styles.birthdayTitle}>Add your birthday</Text>
          <Text style={styles.enter}>{user.birthday ? user.birthday : "Enter details ›"}</Text>
        </View>
        <Text style={styles.cake}>🎂</Text>
      </Pressable>

      <View style={styles.quickGrid}>
        {quickActions.map(([label, icon, route]) => (
          <Pressable key={label} onPress={() => open(route)} style={styles.quickCard}>
            {renderProfileIcon(icon, 26)}
            <Text numberOfLines={1} style={styles.quickText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => navigation.navigate("Settings")} style={styles.appearance}>
        <Text style={styles.sun}>☼</Text>
        <Text style={styles.appearanceText}>Appearance</Text>
        <Text style={styles.light}>LIGHT⌄</Text>
      </Pressable>

      <View style={styles.sensitive}>
        <Text style={styles.hideIcon}>◉</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sensitiveTitle}>Hide sensitive items</Text>
          <Text style={styles.sub}>Sexual wellness, nicotine products and other sensitive items will be hidden</Text>
          <Text style={styles.know}>Know more</Text>
        </View>
        <Switch value={false} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your information</Text>
        {infoRows.map(([label, icon, route]) => (
          <Pressable key={label} onPress={() => route && open(route)} style={styles.infoRow}>
            {renderProfileIcon(icon, 22, styles.infoIcon)}
            <Text style={styles.infoText}>{label}</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.wallet}>
        <Text style={styles.walletLabel}>Wallet balance</Text>
        <Text style={styles.balance}>₹{user.wallet}</Text>
      </View>

      <Pressable onPress={() => (isLoggedIn ? dispatch(logout()) : setLoginOpen(true))} style={[styles.logout, !isLoggedIn && styles.loginButton]}>
        <Text style={[styles.logoutText, !isLoggedIn && styles.loginText]}>{isLoggedIn ? "Logout" : "Login"}</Text>
      </Pressable>
      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} />
      <Modal visible={birthdayOpen} transparent animationType="slide" onRequestClose={() => setBirthdayOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBirthdayOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add your birthday</Text>
            <TextInput value={birthday} onChangeText={setBirthday} placeholder="DD/MM/YYYY" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" style={styles.modalInput} />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setBirthdayOpen(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveBirthday} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function renderProfileIcon(name, size, style) {
  if (name === "heart") return <Ionicons name="heart-outline" size={size} color={colors.text} style={style} />;
  if (name === "wallet") return <Ionicons name="wallet-outline" size={size} color={colors.text} style={style} />;
  return <Feather name={name} size={size} color={colors.text} style={style} />;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F4F5FA" },
  hero: { marginHorizontal: -12, marginTop: -12, paddingTop: 12, paddingBottom: 22, paddingHorizontal: 12, alignItems: "center", backgroundColor: "#F7D85F" },
  back: { alignSelf: "flex-start", width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  avatarWrap: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginTop: 12 },
  photo: { width: 82, height: 82, borderRadius: 41 },
  name: { marginTop: 10, color: colors.text, fontWeight: "900", fontSize: type.heading },
  phone: { marginTop: 4, color: colors.muted, fontSize: type.subheading },
  birthday: { marginTop: -8, minHeight: 64, borderRadius: 8, backgroundColor: "#FFF4CF", padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  birthdayTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  enter: { color: colors.primary, fontWeight: "900", marginTop: 4, fontSize: type.subheading },
  cake: { fontSize: 46 },
  quickGrid: { flexDirection: "row", gap: 8 },
  quickCard: { flex: 1, minHeight: 82, borderRadius: 8, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: 8 },
  quickText: { color: colors.text, fontWeight: "900", marginTop: 6, fontSize: type.subheading },
  appearance: { minHeight: 52, borderRadius: 8, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 },
  sun: { fontSize: 32 },
  appearanceText: { flex: 1, color: colors.text, fontWeight: "900", fontSize: type.heading },
  light: { color: "#38415F", fontWeight: "900", fontSize: type.body },
  sensitive: { borderRadius: 8, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  hideIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F1F3F6", textAlign: "center", textAlignVertical: "center", color: colors.primary, fontSize: 26 },
  sensitiveTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  sub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  know: { color: colors.primary, fontWeight: "900", marginTop: 2, fontSize: type.body },
  infoCard: { backgroundColor: colors.surface, borderRadius: 8, overflow: "hidden" },
  infoTitle: { color: colors.text, fontWeight: "900", fontSize: type.heading, padding: 12 },
  infoRow: { minHeight: 48, borderTopWidth: 1, borderTopColor: colors.faint, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 },
  infoIcon: { width: 34 },
  infoText: { flex: 1, color: colors.text, fontWeight: "800", fontSize: type.subheading },
  chev: { color: colors.muted, fontSize: 30 },
  wallet: { backgroundColor: "#FFF3D7", borderRadius: 8, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  balance: { fontSize: type.heading, color: colors.orange, fontWeight: "900" },
  logout: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.danger, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  logoutText: { color: colors.danger, fontWeight: "900", fontSize: type.subheading },
  loginButton: { borderColor: colors.primary, backgroundColor: colors.primary },
  loginText: { color: "#fff" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14, gap: 12 },
  modalTitle: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  modalInput: { minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12, color: colors.text, fontSize: type.subheading },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, alignItems: "center", justifyContent: "center" },
  saveButton: { flex: 1, minHeight: 44, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  cancelText: { color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  saveText: { color: "#fff", fontSize: type.subheading, fontWeight: "900" }
});
