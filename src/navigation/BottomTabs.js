import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeStack from "./HomeStack";
import CategoryStack from "./CategoryStack";
import SearchStack from "./SearchStack";
import OrderStack from "./OrderStack";
import ProfileStack from "./ProfileStack";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

const Tab = createBottomTabNavigator();
const rootScreens = {
  Home: "HomeFeed",
  Categories: "CategoryHome",
  Search: "SearchHome",
  Orders: "OrdersHome",
  Profile: "ProfileHome"
};

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 18);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          display: (getFocusedRouteNameFromRoute(route) || rootScreens[route.name]) === rootScreens[route.name] ? "flex" : "none",
          height: 58 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          borderTopWidth: 1,
          borderTopColor: colors.faint,
          backgroundColor: colors.surface
        },
        tabBarLabelStyle: { fontSize: type.body, fontWeight: "800" },
        tabBarIcon: ({ color, focused }) => <TabIcon routeName={route.name} color={color} focused={focused} />
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoryStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Orders" component={OrderStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function TabIcon({ routeName, color, focused }) {
  const size = focused ? 23 : 21;
  if (routeName === "Home") return <Feather name="home" size={size} color={color} />;
  if (routeName === "Categories") return <Feather name="grid" size={size} color={color} />;
  if (routeName === "Search") return <Feather name="search" size={size} color={color} />;
  if (routeName === "Orders") return <Feather name="package" size={size} color={color} />;
  return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
}
