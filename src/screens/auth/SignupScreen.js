import React, { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { updateProfile } from "../../store/slices/userSlice";
import { completeSignup } from "../../store/slices/authSlice";
import { showToast } from "../../store/slices/appSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function SignupScreen({ navigation, route }) {
  const user = useSelector((state) => state.user);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const dispatch = useDispatch();
  const submit = () => {
    if (name.trim().length < 2 || !email.includes("@")) {
      dispatch(showToast("Add your name and a valid email"));
      return;
    }
    dispatch(updateProfile({ name, email }));
    dispatch(completeSignup());
    const redirect = route.params?.redirect || { name: "Main" };
    navigation.reset({ index: 0, routes: [redirect] });
  };
  return (
    <Screen contentStyle={styles.wrap}>
      <Text style={styles.title}>Create your profile</Text>
      <Text style={styles.sub}>This keeps your orders, invoices and saved addresses organized.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <AppButton title="Enter Just Harvst" onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: "center" },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { color: colors.muted, lineHeight: 16, fontSize: type.body, textAlign: "center" },
  input: { height: 44, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12, fontSize: type.body }
});
