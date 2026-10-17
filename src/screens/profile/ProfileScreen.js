import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import LoginOtpSheet from "../../components/LoginOtpSheet";
import LogoutConfirmation from "../../components/LogoutConfirmation";
import { selectUserOrders, selectVisibleWalletBalance } from "../../store/selectors";
import { logout } from "../../store/slices/authSlice";
import { updateProfile } from "../../store/slices/userSlice";
import { showToast } from "../../store/slices/appSlice";
import { birthdayError, formatBirthdayInput, profileInitials } from "../../services/profile";
import appConfig from "../../../app.json";

const appRows = [
  { title: "App settings", subtitle: "Notifications, language & appearance", icon: "settings", route: "Settings" },
  { title: "Privacy policy", icon: "shield", page: "PrivacyPolicy" },
  { title: "Terms & conditions", icon: "file-text", page: "TermsConditions" },
  { title: "About Just Harvst", icon: "info", page: "AboutJustHarvst" }
];

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.user);
  const mobile = useSelector((state) => state.auth.mobile);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const walletBalance = useSelector(selectVisibleWalletBalance);
  const orders = useSelector(selectUserOrders);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const pendingAction = React.useRef(null);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [birthdayOpen, setBirthdayOpen] = React.useState(false);
  const [birthday, setBirthday] = React.useState("");
  const [dateError, setDateError] = React.useState("");
  const [photoFailed, setPhotoFailed] = React.useState(false);
  React.useEffect(() => setPhotoFailed(false), [user.photo]);
  React.useEffect(() => { if (!isLoggedIn) setLogoutOpen(false); }, [isLoggedIn]);
  const goBack = () => navigation.canGoBack() ? navigation.goBack() : navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
  const accountAction = (action) => {
    if (isLoggedIn) action();
    else { pendingAction.current = action; setLoginOpen(true); }
  };
  const openLogin = () => { pendingAction.current = null; setLoginOpen(true); };
  const openOrders = () => accountAction(() => navigation.getParent()?.navigate("Orders", { screen: "OrdersHome" }));
  const openWishlist = () => accountAction(() => navigation.getParent()?.getParent()?.navigate("Wishlist"));
  const openWallet = () => accountAction(() => navigation.navigate("Wallet"));
  const editProfile = () => accountAction(() => navigation.navigate("EditProfile"));
  const openBirthday = () => accountAction(() => { setBirthday(user.birthday || ""); setDateError(""); setBirthdayOpen(true); });
  const saveBirthday = () => {
    if (!isLoggedIn) { setBirthdayOpen(false); openLogin(); return; }
    const error = birthdayError(birthday);
    if (error) { setDateError(error); return; }
    dispatch(updateProfile({ birthday: birthday.trim() }));
    setBirthdayOpen(false);
    dispatch(showToast("Birthday updated"));
  };
  const signOut = () => {
    setLogoutOpen(false);
    pendingAction.current = null;
    dispatch(logout());
    dispatch(showToast("Logged out"));
  };
  const name = String(user.name || "").trim() || "Your account";
  const phone = mobile ? (String(mobile).startsWith("+") ? mobile : `+91 ${mobile}`) : "Add your details to complete your profile";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}><Feather name="arrow-left" size={22} color="#264532" /></Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>My account</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Open app settings" onPress={() => navigation.navigate("Settings")} style={styles.iconButton}><Feather name="settings" size={21} color="#0D7163" /></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.accountHero}>
          <Pressable accessibilityRole="button" accessibilityLabel={isLoggedIn ? "Edit your profile" : "Log in to your account"} onPress={isLoggedIn ? editProfile : openLogin} style={styles.identity}>
            <View style={styles.avatar}>{isLoggedIn && user.photo && !photoFailed ? <Image source={{ uri: user.photo }} accessibilityLabel="Your profile photo" onError={() => setPhotoFailed(true)} style={styles.photo} /> : isLoggedIn && profileInitials(user.name) ? <Text style={styles.initials}>{profileInitials(user.name)}</Text> : <Feather name="user" size={29} color="#0D7163" />}</View>
            <View style={styles.identityCopy}><Text numberOfLines={2} style={styles.name}>{isLoggedIn ? name : "Welcome to Just Harvst"}</Text><Text style={styles.phone}>{isLoggedIn ? phone : "Log in to manage your orders and account."}</Text>{isLoggedIn ? <Text style={styles.editLink}>Edit profile</Text> : null}</View>
            {isLoggedIn ? <Feather name="chevron-right" size={19} color="#769581" /> : null}
          </Pressable>
          {!isLoggedIn ? <Pressable accessibilityRole="button" onPress={openLogin} style={styles.loginButton}><Text style={styles.loginText}>Log in or sign up</Text><Feather name="arrow-right" size={17} color="#FFFFFF" /></Pressable> : null}
        </View>

        <View style={styles.main}>
          <View style={styles.quickActions}>
            <QuickAction icon="package" title="Orders" subtitle={isLoggedIn ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}` : "Track & reorder"} onPress={openOrders} />
            <QuickAction icon="heart" title="Wishlist" subtitle="Your saved picks" onPress={openWishlist} />
            <QuickAction icon="message-circle" title="Help" subtitle="We're here to help" onPress={() => navigation.navigate("Support")} />
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Open Fresh Money wallet" onPress={openWallet} style={styles.walletCard}>
            <View style={styles.walletIcon}><Ionicons name="wallet-outline" size={24} color="#0D7163" /></View>
            <View style={styles.walletCopy}><Text style={styles.walletTitle}>Fresh Money</Text><Text style={styles.walletSubtitle}>{isLoggedIn ? "Available wallet balance" : "Log in to view your balance"}</Text></View>
            {isLoggedIn ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.walletBalance}>₹{Number(walletBalance || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Text> : null}
            <Feather name="chevron-right" size={19} color="#0D7163" />
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR ACCOUNT</Text>
            <View style={styles.group}>
              <AccountRow icon="map-pin" title="Saved addresses" subtitle="Manage your delivery locations" onPress={() => accountAction(() => navigation.navigate("Addresses"))} />
              <AccountRow icon="user" title="Personal details" subtitle="Name, photo and email" onPress={editProfile} divider />
              <AccountRow icon="calendar" title="Birthday" subtitle={isLoggedIn && user.birthday ? user.birthday : "Add your birthday · optional"} onPress={openBirthday} divider />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>APP & INFORMATION</Text>
            <View style={styles.group}>{appRows.map((row, index) => <AccountRow key={row.title} icon={row.icon} title={row.title} subtitle={row.subtitle} divider={index > 0} onPress={() => row.page ? navigation.navigate("SettingsInfo", { page: row.page }) : navigation.navigate(row.route)} />)}</View>
          </View>

          {isLoggedIn ? <Pressable accessibilityRole="button" onPress={() => setLogoutOpen(true)} style={styles.logoutButton}><Feather name="log-out" size={18} color="#AA6262" /><Text style={styles.logoutText}>Log out</Text></Pressable> : null}
          <View style={styles.brandFooter}><Text style={styles.brand}>Just Harvst</Text><Text style={styles.version}>Version {appConfig.expo.version}</Text></View>
        </View>
      </ScrollView>

      <LoginOtpSheet visible={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => { const action = pendingAction.current; pendingAction.current = null; action?.(); }} />
      <LogoutConfirmation visible={logoutOpen && isLoggedIn} onClose={() => setLogoutOpen(false)} onConfirm={signOut} />
      <Modal visible={birthdayOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setBirthdayOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss birthday editor" onPress={() => setBirthdayOpen(false)} style={styles.dim} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
            <View style={styles.sheetHeader}><View style={styles.sheetIcon}><Feather name="calendar" size={23} color="#0D7163" /></View><Pressable accessibilityRole="button" accessibilityLabel="Close birthday editor" onPress={() => setBirthdayOpen(false)} style={styles.iconButton}><Feather name="x" size={22} color="#779280" /></Pressable></View>
            <Text style={styles.sheetTitle}>Your birthday</Text>
            <Text style={styles.sheetCopy}>Add or update the birthday on your profile.</Text>
            <Text style={styles.fieldLabel}>Date of birth</Text>
            <TextInput accessibilityLabel="Birthday in day month year format" value={birthday} onChangeText={(value) => { setBirthday(formatBirthdayInput(value)); setDateError(""); }} placeholder="DD/MM/YYYY" placeholderTextColor="#687B6D" keyboardType="number-pad" maxLength={10} style={[styles.dateInput, dateError && styles.dateInputError]} />
            {dateError ? <Text accessibilityLiveRegion="polite" style={styles.dateError}>{dateError}</Text> : null}
            <View style={styles.sheetActions}><Pressable accessibilityRole="button" onPress={() => setBirthdayOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" onPress={saveBirthday} style={styles.saveButton}><Text style={styles.loginText}>Save birthday</Text></Pressable></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function QuickAction({ icon, title, subtitle, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><View style={styles.quickIcon}><Feather name={icon} size={21} color="#0D7163" /></View><Text style={styles.quickTitle}>{title}</Text><Text numberOfLines={1} style={styles.quickSubtitle}>{subtitle}</Text></Pressable>;
}

function AccountRow({ icon, title, subtitle, onPress, divider }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.accountRow, divider && styles.divider, pressed && styles.pressed]}><View style={styles.rowIcon}><Feather name={icon} size={19} color="#718F7B" /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text>{subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}</View><Feather name="chevron-right" size={17} color="#9BAEA1" /></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, backgroundColor: "#FFFFFF" },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#284733", fontSize: 20, fontWeight: "700" },
  content: { backgroundColor: "#F7F9F7" },
  accountHero: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22, backgroundColor: "#FFFFFF", gap: 17 },
  identity: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 66, height: 66, borderRadius: 23, backgroundColor: "#E9F4ED", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  initials: { color: "#0D7163", fontSize: 24, fontWeight: "700" },
  identityCopy: { flex: 1, minWidth: 0, gap: 5 },
  name: { color: "#24472F", fontSize: 21, lineHeight: 27, fontWeight: "800", letterSpacing: -0.4 },
  phone: { color: "#687B6D", fontSize: 12, lineHeight: 18 },
  editLink: { color: "#0D7163", fontSize: 11, fontWeight: "700", marginTop: 1 },
  loginButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 12, backgroundColor: "#0D7163" },
  loginText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  main: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 22, gap: 20 },
  quickActions: { flexDirection: "row", gap: 9 },
  quickCard: { flex: 1, minWidth: 0, paddingVertical: 13, paddingHorizontal: 6, alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EDE7", borderRadius: 14, gap: 6 },
  quickIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#EFF7F2", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  quickTitle: { color: "#3D5F47", fontSize: 12, fontWeight: "700" },
  quickSubtitle: { color: "#687B6D", fontSize: 10 },
  walletCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: "#D6E9DD", backgroundColor: "#EDF7F0" },
  walletIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#DFEFE5", alignItems: "center", justifyContent: "center" },
  walletCopy: { flex: 1, minWidth: 0, gap: 4 },
  walletTitle: { color: "#365C43", fontSize: 13, fontWeight: "700" },
  walletSubtitle: { color: "#687B6D", fontSize: 11, lineHeight: 15 },
  walletBalance: { maxWidth: "40%", flexShrink: 1, color: "#0D7163", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  section: { gap: 10 },
  sectionLabel: { color: "#687B6D", fontSize: 10, letterSpacing: 1, fontWeight: "700", marginLeft: 2 },
  group: { borderRadius: 15, borderWidth: 1, borderColor: "#E6EDE7", backgroundColor: "#FFFFFF", paddingHorizontal: 13 },
  accountRow: { flexDirection: "row", alignItems: "center", minHeight: 58, gap: 11, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: "#EFF3EF" },
  rowIcon: { width: 26, alignItems: "center" },
  rowCopy: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { color: "#3F5B48", fontSize: 13, fontWeight: "600" },
  rowSubtitle: { color: "#687B6D", fontSize: 11, lineHeight: 15 },
  pressed: { opacity: 0.7 },
  logoutButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EDDCDC" },
  logoutText: { color: "#AA6262", fontSize: 12, fontWeight: "700" },
  brandFooter: { alignItems: "center", gap: 5, paddingVertical: 4 },
  brand: { color: "#9CB6A3", fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  version: { color: "#687B6D", fontSize: 10 },
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(18,39,25,0.46)" },
  sheet: { paddingHorizontal: 20, paddingTop: 14, gap: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#FFFFFF" },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: "#ECF7F0", alignItems: "center", justifyContent: "center" },
  sheetTitle: { color: "#36583F", fontSize: 22, fontWeight: "700" },
  sheetCopy: { color: "#687B6D", fontSize: 12, lineHeight: 18, marginBottom: 4 },
  fieldLabel: { color: "#6E8A78", fontSize: 11, fontWeight: "600" },
  dateInput: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#DDEAE1", paddingHorizontal: 13, color: "#3C664A", fontSize: 15, letterSpacing: 1 },
  dateInputError: { borderColor: "#BA7E7E" },
  dateError: { color: "#AF6D6D", fontSize: 11, lineHeight: 17 },
  sheetActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: "#DFEAE2", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#687B6D", fontSize: 12, fontWeight: "700" },
  saveButton: { flex: 1.5, minHeight: 46, borderRadius: 12, backgroundColor: "#0D7163", alignItems: "center", justifyContent: "center" }
});
