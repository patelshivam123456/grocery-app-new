import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import AddressListScreen from "../screens/location/AddressListScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import SettingsInfoScreen from "../screens/settings/SettingsInfoScreen";
import SupportScreen from "../screens/support/SupportScreen";
import WalletScreen from "../screens/misc/WalletScreen";
import { stackOptions } from "./stackOptions";

const Stack = createNativeStackNavigator();
export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit profile" }} />
      <Stack.Screen name="Addresses" component={AddressListScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsInfo" component={SettingsInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
