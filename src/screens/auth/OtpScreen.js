import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import BrandName from "../../components/BrandName";
import { STATIC_DEV_OTP } from "../../services/auth.service";
import { verifyCustomerOtp } from "../../store/slices/authSlice";
import { showToast } from "../../store/slices/appSlice";
import { fetchCatalog } from "../../store/slices/productSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OtpScreen({ navigation, route }) {
  const storedMobile = useSelector((state) => state.auth.mobile);
  const mobile = route.params?.mobile || storedMobile;
  const loading = useSelector((state) => state.auth.loading);
  const [otp, setOtp] = React.useState("");
  const dispatch = useDispatch();

  const submit = async () => {
    if (!/^\d{6}$/.test(otp)) {
      dispatch(showToast("Enter the 6 digit OTP"));
      return;
    }
    try {
      await dispatch(verifyCustomerOtp({ mobile, otp })).unwrap();
      await dispatch(fetchCatalog());
      const redirect = route.params?.redirect || { name: "Main" };
      navigation.reset({ index: 0, routes: [redirect] });
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to verify OTP."));
    }
  };

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrap}>
        <View style={styles.card}>
          <BrandName style={styles.logo} />
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.sub}>Using development OTP {STATIC_DEV_OTP} for +91 {mobile}.</Text>
          <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder={STATIC_DEV_OTP} placeholderTextColor={colors.muted} style={styles.otpInput} autoFocus />
          <AppButton title="Verify and Continue" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1 },
  wrap: { flex: 1, justifyContent: "center" },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, padding: 16, gap: 12 },
  logo: { fontSize: type.heading, fontWeight: "900", color: colors.primary, textAlign: "center" },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { color: colors.muted, lineHeight: 16, fontSize: type.body, textAlign: "center" },
  otpInput: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, backgroundColor: colors.background, color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "left", paddingHorizontal: 14, letterSpacing: 2 }
});
