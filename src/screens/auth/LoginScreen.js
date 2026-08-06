import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import BrandName from "../../components/BrandName";
import { STATIC_DEV_OTP } from "../../services/auth.service";
import { continueAsGuest, generateCustomerOtp, verifyCustomerOtp } from "../../store/slices/authSlice";
import { showToast } from "../../store/slices/appSlice";
import { fetchCatalog } from "../../store/slices/productSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function LoginScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const skip = async () => {
    dispatch(continueAsGuest());
    await dispatch(fetchCatalog());
  };
  const submit = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      dispatch(showToast("Enter a valid 10 digit mobile number"));
      return;
    }
    try {
      setLoading(true);
      await dispatch(generateCustomerOtp(mobile)).unwrap();
      setOtp("");
      setOtpOpen(true);
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };
  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      dispatch(showToast("Enter the 6 digit OTP"));
      return;
    }
    try {
      setLoading(true);
      await dispatch(verifyCustomerOtp({ mobile, otp })).unwrap();
      await dispatch(fetchCatalog());
      const redirect = route.params?.redirect || { name: "Main" };
      navigation.reset({ index: 0, routes: [redirect] });
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to verify OTP."));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrap}>
        <View style={[styles.card, { paddingBottom: 16 + insets.bottom }]}>
          <Pressable onPress={skip} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <BrandName style={styles.logo} />
          <Text style={styles.title}>Login with mobile</Text>
          <Text style={styles.sub}>We will send a one time password to verify your number.</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput value={mobile} onChangeText={setMobile} keyboardType="number-pad" maxLength={10} placeholder="9876543210" placeholderTextColor={colors.muted} style={styles.input} />
          </View>
          <AppButton title="Send OTP" onPress={submit} loading={loading} style={styles.button} />
        </View>
      </KeyboardAvoidingView>
      <Modal visible={otpOpen} transparent animationType="slide" onRequestClose={() => setOtpOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setOtpOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.sub}>Enter the 6 digit OTP sent to +91 {mobile}. Use {STATIC_DEV_OTP} during development.</Text>
            <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder={STATIC_DEV_OTP} placeholderTextColor={colors.muted} style={styles.otpInput} autoFocus />
            <AppButton title="Verify & continue" onPress={verify} loading={loading} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1, padding: 0 },
  wrap: { flex: 1, justifyContent: "flex-end", padding: 0 },
  card: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.faint, paddingHorizontal: 16, paddingTop: 10, gap: 12 },
  skip: { alignSelf: "flex-end", minHeight: 32, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  skipText: { color: colors.primary, fontSize: type.subheading, fontWeight: "900" },
  logo: { fontSize: type.heading, fontWeight: "900", color: colors.primary, textAlign: "center" },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { color: colors.muted, lineHeight: 16, fontSize: type.body, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.faint },
  prefix: { paddingHorizontal: 12, fontWeight: "900", color: colors.text, fontSize: type.subheading },
  input: { flex: 1, height: 44, fontSize: type.heading, color: colors.text },
  button: { marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 12 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.faint, marginBottom: 4 },
  otpInput: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F8FAF7", color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "left", paddingHorizontal: 14, letterSpacing: 2 }
});
