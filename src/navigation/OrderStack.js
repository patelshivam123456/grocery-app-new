import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersScreen from "../screens/orders/OrdersScreen";
import OrderDetailsScreen from "../screens/orders/OrderDetailsScreen";
import TrackingScreen from "../screens/orders/TrackingScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import { stackOptions } from "./stackOptions";

const Stack = createNativeStackNavigator();
export default function OrderStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="OrdersHome" component={OrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: "Order details" }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
