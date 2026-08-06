import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchScreen from "../screens/search/SearchScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import CartScreen from "../screens/cart/CartScreen";
import { stackOptions } from "./stackOptions";

const Stack = createNativeStackNavigator();
export default function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="SearchHome" component={SearchScreen} options={{ title: "Search" }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}
