import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import AddressListScreen from "../screens/location/AddressListScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
    </Stack.Navigator>
  );
}
