import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryScreen from "../screens/category/CategoryScreen";
import ProductListScreen from "../screens/category/ProductListScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import PaymentScreen from "../screens/checkout/PaymentScreen";
import OrderSuccessScreen from "../screens/checkout/OrderSuccessScreen";
import AddressListScreen from "../screens/location/AddressListScreen";
import TrackingScreen from "../screens/orders/TrackingScreen";
import { stackOptions } from "./stackOptions";

const Stack = createNativeStackNavigator();
export default function CategoryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CategoryHome" component={CategoryScreen} options={{ title: "Categories" }} />
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ headerShown: false }} />
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
