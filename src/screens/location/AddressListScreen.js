import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../components/AppButton";
import EmptyState from "../../components/EmptyState";
import { deleteAddress, selectAddress, setCoordinates, setPermission, upsertAddress } from "../../store/slices/locationSlice";
import { showToast } from "../../store/slices/appSlice";
import { colors } from "../../theme/colors";

export default function AddressListScreen({ navigation }) {
  const { addresses, selectedAddressId, permission } = useSelector((state) => state.location);
  const [form, setForm] = React.useState({ label: "Home", line1: "", city: "", pincode: "" });
  const [adding, setAdding] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const dispatch = useDispatch();

  const close = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("HomeFeed"));

  const locate = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      dispatch(setPermission(status));
      if (status !== "granted") {
        dispatch(showToast("Location permission was not granted"));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      dispatch(setCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      dispatch(upsertAddress({ id: "current-location", label: "Current Location", line1: "Detected from device GPS", city: "Nearby area", pincode: "000000" }));
      dispatch(selectAddress("current-location"));
      dispatch(showToast("Current location saved"));
      close();
    } catch (error) {
      dispatch(showToast("Unable to detect current location"));
    } finally {
      setLocating(false);
    }
  };

  const save = () => {
    if (!form.line1.trim() || !form.city.trim()) {
      dispatch(showToast("Add address line and city"));
      return;
    }
    dispatch(upsertAddress(form));
    setForm({ label: "Home", line1: "", city: "", pincode: "" });
    setAdding(false);
    dispatch(showToast("Address saved"));
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.overlay}>
      <Pressable style={styles.dim} onPress={close} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Select delivery location</Text>
          <Pressable onPress={close}><Text style={styles.close}>×</Text></Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <AppButton title={locating ? "Detecting Location..." : "Use Current Location"} onPress={locate} loading={locating} />
          <Text style={styles.permission}>Permission: {permission}</Text>
          <Pressable onPress={() => setAdding((value) => !value)} style={styles.addRow}>
            <Text style={styles.plus}>+</Text>
            <Text style={styles.addText}>Add new address</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
          {adding ? (
            <View style={styles.card}>
              <Text style={styles.titleSmall}>Add address manually</Text>
              {["label", "line1", "city", "pincode"].map((key) => (
                <TextInput key={key} value={form[key]} onChangeText={(text) => setForm({ ...form, [key]: text })} placeholder={key === "line1" ? "Flat, building, street" : key} placeholderTextColor={colors.muted} style={styles.input} />
              ))}
              <AppButton title="Save Address" onPress={save} />
            </View>
          ) : null}
          {!addresses.length ? <EmptyState title="No saved addresses" subtitle="Add home, work or a custom delivery location." /> : null}
          {addresses.map((item) => (
            <Pressable key={item.id} onPress={() => { dispatch(selectAddress(item.id)); close(); }} style={[styles.address, selectedAddressId === item.id && styles.selected]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.label}</Text>
                <Text style={styles.sub}>{item.line1}, {item.city} {item.pincode}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteAddress(item.id))}><Text style={styles.delete}>Delete</Text></Pressable>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.62)" },
  dim: { ...StyleSheet.absoluteFillObject },
  sheet: { maxHeight: "84%", backgroundColor: "#F4F5FA", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14, gap: 12 },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.faint },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  close: { color: colors.text, fontSize: 32, lineHeight: 34, fontWeight: "700" },
  content: { gap: 10, paddingBottom: 20 },
  permission: { color: colors.muted, textAlign: "center" },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 14, gap: 10 },
  title: { fontSize: 18, fontWeight: "900", color: colors.text },
  titleSmall: { fontSize: 16, fontWeight: "900", color: colors.text },
  input: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12, color: colors.text },
  addRow: { minHeight: 52, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  plus: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  addText: { flex: 1, color: colors.primaryDark, fontWeight: "900" },
  chev: { color: colors.muted, fontSize: 22 },
  address: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: colors.faint },
  selected: { borderColor: colors.primary, backgroundColor: "#EDF9F0" },
  name: { fontWeight: "900", color: colors.text },
  sub: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  delete: { color: colors.danger, fontWeight: "800" }
});
