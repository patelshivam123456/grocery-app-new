import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import OnboardingScreen from "../screens/auth/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import AppDrawer from "./AppDrawer";
import Toast from "../components/Toast";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const guestMode = useSelector((state) => state.auth.guestMode);
  const onboardingComplete = useSelector((state) => state.auth.onboardingComplete);
  const canEnterApp = isLoggedIn || guestMode;

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : canEnterApp ? (
          <Stack.Screen name="Main" component={AppDrawer} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </>
  );
}
