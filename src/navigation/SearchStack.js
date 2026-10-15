import React from "react";
import { Keyboard, Pressable, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchScreen from "../screens/search/SearchScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import CartScreen from "../screens/cart/CartScreen";
import { stackOptions } from "./stackOptions";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
export default function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="SearchHome" component={SearchScreen} options={({ navigation }) => ({
        title: "Search",
        headerRight: () => (
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel search and return home" hitSlop={10} onPress={() => {
            Keyboard.dismiss();
            navigation.getParent()?.navigate("Home", { screen: "HomeFeed" });
          }}>
            <Text style={{ color: colors.primaryDark, fontSize: 14, fontWeight: "700" }}>Cancel</Text>
          </Pressable>
        )
      })} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}
