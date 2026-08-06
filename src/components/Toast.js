import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearToast } from "../store/slices/appSlice";
import { colors } from "../theme/colors";

export default function Toast() {
  const toast = useSelector((state) => state.app.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast()), 2200);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;
  return <Text style={styles.toast}>{toast}</Text>;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 92,
    padding: 14,
    borderRadius: 8,
    overflow: "hidden",
    color: "#fff",
    backgroundColor: colors.text,
    textAlign: "center",
    fontWeight: "800"
  }
});
