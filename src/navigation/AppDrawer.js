import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Text, View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BottomTabs from "./BottomTabs";
import BrandName from "../components/BrandName";
import AddressListScreen from "../screens/location/AddressListScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import SupportScreen from "../screens/support/SupportScreen";
import OffersScreen from "../screens/misc/OffersScreen";
import WalletScreen from "../screens/misc/WalletScreen";
import { logout } from "../store/slices/authSlice";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

const Drawer = createDrawerNavigator();

function DrawerContent(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const go = (screen, params) => props.navigation.navigate("Tabs", { screen, params });
  const item = (label, icon, onPress, danger = false) => (
    <DrawerItem
      label={label}
      icon={() => <DrawerIcon name={icon} danger={danger} />}
      labelStyle={[styles.itemLabel, danger && { color: colors.danger }]}
      style={styles.drawerItem}
      onPress={onPress}
    />
  );
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.brand}>
        <View style={styles.avatar}><Feather name="user" size={22} color={colors.text} /></View>
        <View style={{ flex: 1 }}>
          <BrandName style={styles.logo} />
          <Text numberOfLines={1} style={styles.sub}>{user.name || "Fresh grocery shopper"}</Text>
        </View>
      </View>
      {item("Home", "home", () => go("Home"))}
      {item("Categories", "grid", () => go("Categories"))}
      {item("My Orders", "package", () => go("Orders"))}
      {item("Wishlist", "heart", () => props.navigation.navigate("Wishlist"))}
      {item("Addresses", "map-pin", () => props.navigation.navigate("Addresses"))}
      {item("Wallet", "wallet", () => props.navigation.navigate("Wallet"))}
      {item("Offers", "tag", () => props.navigation.navigate("Offers"))}
      {item("Customer Support", "help-circle", () => props.navigation.navigate("Support"))}
      {item("Settings", "settings", () => props.navigation.navigate("Settings"))}
      {item("Logout", "log-out", () => dispatch(logout()), true)}
    </DrawerContentScrollView>
  );
}

function DrawerIcon({ name, danger }) {
  const color = danger ? colors.danger : colors.text;
  if (name === "heart") return <Ionicons name="heart-outline" size={21} color={color} style={styles.itemIcon} />;
  if (name === "wallet") return <Ionicons name="wallet-outline" size={21} color={color} style={styles.itemIcon} />;
  return <Feather name={name} size={20} color={color} style={styles.itemIcon} />;
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Tabs" component={BottomTabs} />
      <Drawer.Screen name="Wishlist" component={require("../screens/wishlist/WishlistScreen").default} />
      <Drawer.Screen name="Addresses" component={AddressListScreen} />
      <Drawer.Screen name="Wallet" component={WalletScreen} />
      <Drawer.Screen name="Offers" component={OffersScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { paddingTop: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginHorizontal: 10, borderRadius: 8, backgroundColor: "#E8F8EE", marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  logo: { fontSize: type.heading, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 2, fontSize: type.body },
  drawerItem: { borderRadius: 8, marginHorizontal: 8 },
  itemIcon: { width: 22, textAlign: "center" },
  itemLabel: { color: colors.text, fontSize: type.subheading, fontWeight: "800", marginLeft: -14 }
});
