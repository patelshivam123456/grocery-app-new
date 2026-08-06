import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export default function SkeletonRow() {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((item) => <View key={item} style={styles.box} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  box: { width: 110, height: 88, backgroundColor: colors.faint, borderRadius: 8 }
});
