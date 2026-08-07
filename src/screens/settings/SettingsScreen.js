import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, setTheme, toggleNotifications } from "../../store/slices/settingsSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const infoPages = [
  ["Privacy Policy", "PrivacyPolicy"],
  ["Terms & Conditions", "TermsConditions"],
  ["About Just Harvst", "AboutJustHarvst"]
];

export default function SettingsScreen({ navigation }) {
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("Tabs", { screen: "Profile" }));
  const chooseLanguage = (item) => {
    dispatch(setLanguage(item));
    Alert.alert("Language updated", `${item} selected.`);
  };
  const chooseTheme = (item) => {
    dispatch(setTheme(item));
    Alert.alert("Theme updated", `${item} theme selected.`);
  };
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconCircle}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.iconCircle}>
          <Feather name="settings" size={19} color={colors.text} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
        <View style={styles.row}>
          <Text style={styles.name}>Notifications</Text>
          <Switch value={settings.notifications} onValueChange={() => dispatch(toggleNotifications())} thumbColor={settings.notifications ? colors.primary : "#fff"} />
        </View>
        <Text style={styles.title}>Language</Text>
        <View style={styles.segment}>{["English", "Hindi", "Kannada"].map((item) => <Pressable key={item} onPress={() => chooseLanguage(item)} style={[styles.seg, settings.language === item && styles.active]}><Text style={[styles.segText, settings.language === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
        <Text style={styles.title}>Theme</Text>
        <View style={styles.segment}>{["Light", "Dark", "System"].map((item) => <Pressable key={item} onPress={() => chooseTheme(item)} style={[styles.seg, settings.theme === item && styles.active]}><Text style={[styles.segText, settings.theme === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
        {infoPages.map(([label, page]) => (
          <Pressable key={page} onPress={() => navigation.navigate("SettingsInfo", { page })} style={styles.row}>
            <Text style={styles.name}>{label}</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
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
  content: { padding: 12, gap: 12 },
  row: { minHeight: 48, backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { color: colors.text, fontWeight: "800", fontSize: type.subheading },
  title: { color: colors.text, fontWeight: "900", fontSize: type.heading },
  segment: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 8, padding: 4, gap: 4 },
  seg: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  active: { backgroundColor: colors.primary },
  segText: { color: colors.text, fontWeight: "800", fontSize: type.body },
  activeText: { color: "#fff" },
  chev: { color: colors.muted, fontSize: 24 }
});
