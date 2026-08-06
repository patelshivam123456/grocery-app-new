import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import PaymentScreen from "../screens/checkout/PaymentScreen";
import OrderSuccessScreen from "../screens/checkout/OrderSuccessScreen";
import TrackingScreen from "../screens/orders/TrackingScreen";
import AddressListScreen from "../screens/location/AddressListScreen";
import { stackOptions } from "./stackOptions";

const Stack = createNativeStackNavigator();
export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Addresses" component={AddressListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
