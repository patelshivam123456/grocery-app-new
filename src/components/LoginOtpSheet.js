import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";
import AppButton from "./AppButton";
import { STATIC_DEV_OTP } from "../services/auth.service";
import { generateCustomerOtp, verifyCustomerOtp } from "../store/slices/authSlice";
import { showToast } from "../store/slices/appSlice";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function LoginOtpSheet({ visible, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [mobile, setMobile] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState("mobile");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setStep("mobile");
      setOtp("");
      setLoading(false);
    }
  }, [visible]);

  const sendOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      dispatch(showToast("Enter a valid 10 digit mobile number"));
      return;
    }
    try {
      setLoading(true);
      setMobile(cleanMobile);
      await dispatch(generateCustomerOtp(cleanMobile)).unwrap();
      setStep("otp");
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      dispatch(showToast("Enter the 6 digit OTP"));
      return;
    }
    try {
      setLoading(true);
      await dispatch(verifyCustomerOtp({ mobile, otp })).unwrap();
      onClose?.();
      onSuccess?.(mobile);
    } catch (error) {
      dispatch(showToast(error?.friendlyMessage || error?.message || "Unable to verify OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{step === "mobile" ? "Login to continue" : "Verify OTP"}</Text>
          <Text style={styles.sub}>
            {step === "mobile" ? "Enter your mobile number to place orders and manage your account." : `Using development OTP ${STATIC_DEV_OTP} for +91 ${mobile}.`}
          </Text>

          {step === "mobile" ? (
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                value={mobile}
                onChangeText={setMobile}
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
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholder={STATIC_DEV_OTP}
                placeholderTextColor={colors.muted}
                style={styles.otpInput}
                autoFocus
              />
              <Pressable onPress={() => setStep("mobile")}>
                <Text style={styles.changeNumber}>Change number</Text>
              </Pressable>
            </View>
          )}

          <AppButton title={step === "mobile" ? "Send OTP" : "Verify & continue"} onPress={step === "mobile" ? sendOtp : confirmOtp} loading={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 12 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.faint, marginBottom: 4 },
  title: { color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: "900" },
  sub: { color: colors.muted, fontSize: type.subheading, lineHeight: 17 },
  inputRow: { height: 48, flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F8FAF7" },
  prefix: { paddingHorizontal: 12, color: colors.text, fontSize: type.subheading, fontWeight: "900" },
  input: { flex: 1, height: 48, color: colors.text, fontSize: type.heading, fontWeight: "800" },
  otpWrap: { gap: 9 },
  otpInput: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.faint, backgroundColor: "#F8FAF7", color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "center", letterSpacing: 8 },
  changeNumber: { color: colors.primary, fontSize: type.subheading, fontWeight: "900", textAlign: "center" }
});
