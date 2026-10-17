import React from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import AppButton from "./AppButton";
import { STATIC_DEV_OTP } from "../services/auth.service";
import { generateCustomerOtp, verifyCustomerOtp } from "../store/slices/authSlice";
import { showToast } from "../store/slices/appSlice";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function LoginOtpSheet({ visible, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState("mobile");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const session = React.useRef(0);
  const close = () => { session.current += 1; Keyboard.dismiss(); onClose?.(); };

  React.useEffect(() => {
    session.current += 1;
    if (!visible) {
      setStep("mobile");
      setOtp("");
      setLoading(false);
      setError("");
    }
    return () => { session.current += 1; };
  }, [visible]);

  const sendOtp = async () => {
    if (loading) return;
    const cleanMobile = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Enter a valid 10 digit mobile number");
      dispatch(showToast("Enter a valid 10 digit mobile number"));
      return;
    }
    const request = session.current;
    try {
      setError("");
      setLoading(true);
      setMobile(cleanMobile);
      await dispatch(generateCustomerOtp(cleanMobile)).unwrap();
      if (request !== session.current) return;
      setStep("otp");
    } catch (error) {
      if (request !== session.current) return;
      const message = error?.friendlyMessage || error?.message || "Unable to send OTP. Please try again.";
      setError(message);
      dispatch(showToast(message));
    } finally {
      if (request === session.current) setLoading(false);
    }
  };

  const confirmOtp = async () => {
    if (loading) return;
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6 digit OTP");
      dispatch(showToast("Enter the 6 digit OTP"));
      return;
    }
    const request = session.current;
    try {
      setError("");
      setLoading(true);
      await dispatch(verifyCustomerOtp({ mobile, otp })).unwrap();
      if (request !== session.current) return;
      Keyboard.dismiss();
      onClose?.();
      onSuccess?.(mobile);
    } catch (error) {
      if (request !== session.current) return;
      const message = error?.friendlyMessage || error?.message || "Unable to verify OTP. Please try again.";
      setError(message);
      dispatch(showToast(message));
    } finally {
      if (request === session.current) setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss login" style={styles.dim} onPress={close} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), marginTop: insets.top + 12 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
          <Text style={styles.title}>{step === "mobile" ? "Login to continue" : "Verify OTP"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close login" onPress={close} style={styles.closeButton}><Feather name="x" size={21} color="#687C70" /></Pressable>
          </View>
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.sub}>
            {step === "mobile" ? "Enter your mobile number to place orders and manage your account." : `Using development OTP ${STATIC_DEV_OTP} for +91 ${mobile}.`}
          </Text>

          {step === "mobile" ? (
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                key="mobile"
                accessibilityLabel="Mobile number"
                value={mobile}
                onChangeText={(text) => { setMobile(text); setError(""); }}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="9876543210"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.otpWrap}>
              <TextInput
                key="otp"
                accessibilityLabel="Six digit OTP"
                value={otp}
                onChangeText={(text) => { setOtp(text); setError(""); }}
                keyboardType="number-pad"
                maxLength={6}
                placeholder={STATIC_DEV_OTP}
                placeholderTextColor={colors.muted}
                style={styles.otpInput}
                autoFocus
              />
              <Pressable accessibilityRole="button" disabled={loading} onPress={() => { setStep("mobile"); setError(""); }} style={styles.changeNumberButton}>
                <Text style={styles.changeNumber}>Change number</Text>
              </Pressable>
            </View>
          )}

          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <AppButton title={step === "mobile" ? "Send OTP" : "Verify & continue"} onPress={step === "mobile" ? sendOtp : confirmOtp} loading={loading} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" },
  sheet: { maxHeight: "90%", flexShrink: 1, backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingBottom: 4 },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  formScroll: { flexGrow: 0, flexShrink: 1 },
  formContent: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 4, gap: 14 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.faint, marginBottom: 4 },
  title: { flex: 1, color: "#244A33", fontSize: 20, lineHeight: 26, fontWeight: "700" },
  sub: { color: colors.muted, fontSize: type.subheading, lineHeight: 17 },
  inputRow: { height: 48, flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F8FAF7" },
  prefix: { paddingHorizontal: 12, color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  input: { flex: 1, height: 48, color: colors.text, fontSize: type.heading, fontWeight: "800" },
  otpWrap: { gap: 9 },
  otpInput: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F8FAF7", color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: 8 },
  changeNumberButton: { minHeight: 36, justifyContent: "center" },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  changeNumber: { color: colors.primary, fontSize: type.subheading, fontWeight: "900", textAlign: "center" }
});
