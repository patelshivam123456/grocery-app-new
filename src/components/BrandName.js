import React from "react";
import { StyleSheet, Text } from "react-native";

export default function BrandName({ style, justStyle, harvstStyle }) {
  return (
    <Text style={[styles.wrap, style]}>
      <Text style={[styles.just, justStyle]}>Just </Text>
      <Text style={[styles.harvst, harvstStyle]}>Harvst</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wrap: { color: "#000000" },
  just: { color: "#000000" },
  harvst: { color: "#2E7D32" }
});
