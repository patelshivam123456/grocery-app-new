import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import { setLanguage, setTheme, toggleNotifications } from "../../store/slices/settingsSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function SettingsScreen() {
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  return (
    <Screen>
      <View style={styles.row}>
        <Text style={styles.name}>Notifications</Text>
        <Switch value={settings.notifications} onValueChange={() => dispatch(toggleNotifications())} thumbColor={settings.notifications ? colors.primary : "#fff"} />
      </View>
      <Text style={styles.title}>Language</Text>
      <View style={styles.segment}>{["English", "Hindi", "Kannada"].map((item) => <Pressable key={item} onPress={() => dispatch(setLanguage(item))} style={[styles.seg, settings.language === item && styles.active]}><Text style={[styles.segText, settings.language === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
      <Text style={styles.title}>Theme</Text>
      <View style={styles.segment}>{["Light", "Dark", "System"].map((item) => <Pressable key={item} onPress={() => dispatch(setTheme(item))} style={[styles.seg, settings.theme === item && styles.active]}><Text style={[styles.segText, settings.theme === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
      {["Privacy Policy", "Terms and Conditions", "About Just Harvst"].map((item) => <View key={item} style={styles.row}><Text style={styles.name}>{item}</Text><Text style={styles.chev}>›</Text></View>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
