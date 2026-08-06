import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GroceryIntroAnimation from "./src/components/GroceryIntroAnimation";
import { store } from "./src/store";
import { hydrateApp } from "./src/store/bootstrap";
import { markOrderDelivered } from "./src/store/slices/orderSlice";
import RootNavigator from "./src/navigation/RootNavigator";

const DELIVERY_COMPLETE_DELAY_MS = 30000;

function OrderDeliveryTimer() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);

  useEffect(() => {
    const timers = orders
      .filter((order) => order.status !== "Cancelled" && order.status !== "Delivered")
      .map((order) => {
        const elapsed = Date.now() - new Date(order.createdAt).getTime();
        const remaining = Math.max(DELIVERY_COMPLETE_DELAY_MS - elapsed, 0);
        return setTimeout(() => dispatch(markOrderDelivered(order.id)), remaining);
      });

    return () => timers.forEach(clearTimeout);
  }, [dispatch, orders]);

  return null;
}

function Bootstrap() {
  const dispatch = useDispatch();
  const bootstrapped = useSelector((state) => state.app.bootstrapped);
  const onboardingComplete = useSelector((state) => state.auth.onboardingComplete);
  const [splashVisible, setSplashVisible] = React.useState(false);
  const [splashComplete, setSplashComplete] = React.useState(false);
  const previousOnboardingComplete = React.useRef(onboardingComplete);

  useEffect(() => {
    dispatch(hydrateApp());
  }, [dispatch]);

  React.useEffect(() => {
    if (!bootstrapped) return;
    if (!previousOnboardingComplete.current && onboardingComplete) {
      setSplashVisible(true);
      setSplashComplete(false);
    }
    previousOnboardingComplete.current = onboardingComplete;
  }, [bootstrapped, onboardingComplete]);

  if (!bootstrapped) {
    return null;
  }

  if (splashVisible && !splashComplete) {
    return <GroceryIntroAnimation onComplete={() => setSplashComplete(true)} />;
  }

  return (
    <NavigationContainer>
      <OrderDeliveryTimer />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Bootstrap />
      </SafeAreaProvider>
    </Provider>
  );
}
