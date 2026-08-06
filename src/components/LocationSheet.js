import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { selectAddress, setCoordinates, setPermission, upsertAddress } from "../store/slices/locationSlice";
import { showToast } from "../store/slices/appSlice";
import AppButton from "./AppButton";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

export default function LocationSheet({ visible, onClose }) {
  const dispatch = useDispatch();
  const addresses = useSelector((state) => state.location.addresses);
  const selectedAddressId = useSelector((state) => state.location.selectedAddressId);
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ label: "Home", line1: "", city: "", pincode: "" });
  const [locating, setLocating] = React.useState(false);

  const useCurrent = async () => {
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
      const current = {
        id: "current-location",
        label: "Current Location",
        line1: "Detected from device GPS",
        city: "Nearby area",
        pincode: "000000",
        phone: "8707868591"
      };
      dispatch(upsertAddress(current));
      dispatch(selectAddress(current.id));
      dispatch(showToast("Current location saved"));
      onClose();
    } catch (error) {
      dispatch(showToast("Unable to detect current location"));
    } finally {
      setLocating(false);
    }
  };

  const saveNew = () => {
    if (!form.line1.trim() || !form.city.trim()) {
      dispatch(showToast("Add address line and city"));
      return;
    }
    dispatch(upsertAddress({ ...form, phone: "8707868591" }));
    setForm({ label: "Home", line1: "", city: "", pincode: "" });
    setAdding(false);
    dispatch(showToast("Address saved"));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dim} onPress={onClose} />
        <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select delivery location</Text>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput placeholder="Search for area, street name..." placeholderTextColor={colors.muted} style={styles.searchInput} />
          </View>

          <View style={styles.card}>
            <Pressable onPress={useCurrent} style={styles.option}>
              <Text style={styles.optionIcon}>⌖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.greenTitle}>Use current location</Text>
                <Text style={styles.optionSub}>{locating ? "Detecting from device..." : "Detected from device GPS"}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
            <Pressable onPress={() => setAdding((value) => !value)} style={styles.optionLine}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.greenTitle}>Add new address</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
            <Pressable style={styles.optionLine}>
              <Text style={styles.whatsapp}>☎</Text>
              <Text style={styles.optionTitle}>Request address from someone else</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          </View>

          {adding ? (
            <View style={styles.formCard}>
              <Text style={styles.title}>Add address manually</Text>
              {["label", "line1", "city", "pincode"].map((key) => (
                <TextInput
                  key={key}
                  value={form[key]}
                  onChangeText={(text) => setForm({ ...form, [key]: text })}
                  placeholder={key === "line1" ? "Flat, building, street" : key}
                  placeholderTextColor={colors.muted}
                  style={styles.formInput}
                />
              ))}
              <AppButton title="Save Address" onPress={saveNew} />
            </View>
          ) : null}

          <Pressable style={styles.importRow}>
            <Text style={styles.zomato}>Z</Text>
            <Text style={styles.optionTitle}>Import your addresses from Zomato</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>

          <Text style={styles.saved}>Your saved addresses</Text>
          {addresses.map((item) => (
            <Pressable key={item.id} onPress={() => { dispatch(selectAddress(item.id)); onClose(); }} style={styles.addressCard}>
              <View style={styles.mapBadge}>
                <Text style={styles.pin}>📍</Text>
                {item.id === selectedAddressId ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>{item.label}</Text>
                <Text style={styles.optionSub}>{item.line1}, {item.city}</Text>
                <Text style={styles.optionSub}>Phone number: {item.phone || "8707868591"}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.62)" },
  close: { alignSelf: "center", marginBottom: -20, zIndex: 2, width: 54, height: 54, borderRadius: 27, backgroundColor: "#202027", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#fff", fontSize: 32, lineHeight: 34, fontWeight: "700" },
  sheet: { maxHeight: "78%", backgroundColor: "#F4F5FA", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14, gap: 12 },
  title: { color: colors.text, fontSize: type.heading, fontWeight: "900" },
  search: { height: 44, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  searchIcon: { fontSize: 20, color: colors.text },
  searchInput: { flex: 1, color: colors.text, fontSize: type.subheading },
  card: { backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  optionLine: { minHeight: 50, borderTopWidth: 1, borderTopColor: colors.faint, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12 },
  optionIcon: { width: 30, color: colors.primary, fontSize: 24, fontWeight: "900", textAlign: "center" },
  greenTitle: { color: colors.primaryDark, fontWeight: "900", fontSize: type.heading },
  optionTitle: { flex: 1, color: colors.text, fontWeight: "900", fontSize: type.subheading },
  optionSub: { color: colors.muted, lineHeight: 15, fontSize: type.body },
  plus: { width: 30, color: colors.primary, fontSize: 24, fontWeight: "900", textAlign: "center" },
  whatsapp: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#21C45A", color: "#fff", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  chev: { color: colors.muted, fontSize: 24 },
  importRow: { minHeight: 54, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  zomato: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#E23744", color: "#fff", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  saved: { color: colors.muted, fontSize: type.subheading, fontWeight: "800" },
  addressCard: { borderRadius: 12, backgroundColor: colors.surface, padding: 12, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  formCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, gap: 10 },
  formInput: { height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12, color: colors.text, fontSize: type.body },
  mapBadge: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#EAFBEF", alignItems: "center", justifyContent: "center" },
  pin: { fontSize: 22 },
  tick: { position: "absolute", top: -6, left: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.success, color: "#fff", textAlign: "center", fontSize: type.body, fontWeight: "900" },
  addressLabel: { color: colors.text, fontWeight: "900", fontSize: type.heading }
});
