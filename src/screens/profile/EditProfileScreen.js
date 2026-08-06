import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { updateProfile } from "../../store/slices/userSlice";
import { showToast } from "../../store/slices/appSlice";
import { colors } from "../../theme/colors";

export default function EditProfileScreen({ navigation }) {
  const user = useSelector((state) => state.user);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState(user.photo);
  const dispatch = useDispatch();
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };
  const save = () => {
    dispatch(updateProfile({ name, email, photo }));
    dispatch(showToast("Profile updated"));
    navigation.goBack();
  };
  return (
    <Screen>
      <View style={styles.center}>
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <Text style={styles.avatar}>{name?.[0] || "F"}</Text>}
        <AppButton title="Upload Photo" variant="outline" onPress={pick} />
      </View>
      <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} keyboardType="email-address" />
      <AppButton title="Save Profile" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", gap: 12 },
  photo: { width: 112, height: 112, borderRadius: 56 },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: "#DFF7E8", textAlign: "center", textAlignVertical: "center", fontSize: 44, color: colors.primary, fontWeight: "900" },
  input: { height: 52, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.faint, paddingHorizontal: 12 }
});
