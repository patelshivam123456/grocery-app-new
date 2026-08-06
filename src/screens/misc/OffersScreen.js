import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Screen from "../../components/Screen";
import { coupons } from "../../data/mockData";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

export default function OffersScreen() {
  return (
    <Screen>
      {coupons.map((coupon) => (
        <View key={coupon.id} style={styles.offer}>
          <Text style={styles.code}>{coupon.title}</Text>
          <Text style={styles.title}>Get ₹{coupon.discount} off</Text>
          <Text style={styles.sub}>Valid on cart value above ₹{coupon.min}. Apply from the cart screen.</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  offer: { backgroundColor: "#FFF2D3", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#F5D47C" },
  code: { color: colors.orange, fontWeight: "900", fontSize: type.heading },
  title: { color: colors.text, fontWeight: "900", fontSize: type.heading, marginTop: 6 },
  sub: { color: colors.muted, marginTop: 5, lineHeight: 15, fontSize: type.body }
});
